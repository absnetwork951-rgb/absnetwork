'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';
import { createShopProduct, updateShopProduct, deleteShopProduct, getShopProductById } from '../db';

const ShopProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Slug is required'),
  category: z.enum(['network_cables', 'fiber_optics', 'fiber_accessories', 'routers', 'network_switches', 'optical_devices', 'network_accessories', 'tools_testing', 'rack_cabinet', 'other']),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  sku: z.string().optional(),
  powerRatingWatts: z.coerce.number().optional(),
  capacityAh: z.coerce.number().optional(),
  pricePkr: z.coerce.number().min(0, 'Price must be positive'),
  salePricePkr: z.coerce.number().optional(),
  stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'on_order', 'pre_order']),
  stockQuantity: z.coerce.number().default(10),
  warrantyYears: z.coerce.number().default(1),
  shortDescription: z.string().min(5, 'Short description is required'),
  fullDescription: z.string().min(10, 'Full description is required'),
  specifications: z.record(z.string(), z.string()),
  features: z.array(z.string()),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.string()),
  displayOrder: z.coerce.number().default(1),
});

export async function saveShopProductAction(formData: FormData) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_shop_products')) {
    return { success: false, error: 'Unauthorized: You do not have permission to manage shop products.' };
  }

  const id = formData.get('id')?.toString().trim();
  const rawFeatures = formData.get('features')?.toString() || '';
  const featuresList = rawFeatures.split('\n').map((f) => f.trim()).filter(Boolean);

  const rawImages = formData.get('images')?.toString() || '';
  const imagesList = rawImages.split('\n').map((img) => img.trim()).filter(Boolean);

  const rawSpecs = formData.get('specifications')?.toString() || '';
  const specsObj: Record<string, string> = {};
  rawSpecs.split('\n').forEach((line) => {
    const [k, ...v] = line.split(':');
    if (k && v.length) {
      specsObj[k.trim()] = v.join(':').trim();
    }
  });

  const rawData = {
    name: formData.get('name')?.toString().trim(),
    slug: formData.get('slug')?.toString().trim() || formData.get('name')?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: formData.get('category')?.toString() as any,
    brand: formData.get('brand')?.toString().trim() || 'ABS Network',
    model: formData.get('model')?.toString().trim() || 'Custom',
    sku: formData.get('sku')?.toString().trim() || undefined,
    powerRatingWatts: Number(formData.get('powerRatingWatts')) || undefined,
    capacityAh: Number(formData.get('capacityAh')) || undefined,
    pricePkr: Number(formData.get('pricePkr')),
    salePricePkr: Number(formData.get('salePricePkr')) || undefined,
    stockStatus: (formData.get('stockStatus')?.toString() as any) || 'in_stock',
    stockQuantity: Number(formData.get('stockQuantity')) || 0,
    warrantyYears: Number(formData.get('warrantyYears')) || 1,
    shortDescription: formData.get('shortDescription')?.toString().trim() || '',
    fullDescription: formData.get('fullDescription')?.toString().trim() || '',
    specifications: specsObj,
    features: featuresList,
    isFeatured: formData.get('isFeatured') === 'true' || formData.get('isFeatured') === 'on',
    isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
    images: imagesList.length > 0 ? imagesList : [],
    displayOrder: Number(formData.get('displayOrder')) || 1,
  };

  const parsed = ShopProductSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  const ip = await getClientIp();

  let resProd;
  if (id) {
    resProd = updateShopProduct(id, parsed.data, { id: current.user.id, email: current.user.email }, ip);
  } else {
    resProd = createShopProduct(parsed.data, { id: current.user.id, email: current.user.email }, ip);
  }

  revalidatePath('/shop');
  revalidatePath('/');
  revalidatePath('/admin/shop');
  revalidatePath('/admin/dashboard');

  return { success: true, product: resProd };
}

export async function deleteShopProductAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_shop_products')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete shop products.' };
  }

  const ip = await getClientIp();
  deleteShopProduct(id, { id: current.user.id, email: current.user.email }, ip);

  revalidatePath('/shop');
  revalidatePath('/');
  revalidatePath('/admin/shop');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function toggleShopProductActiveAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_shop_products')) {
    return { success: false, error: 'Unauthorized: You do not have permission to edit shop products.' };
  }

  const prod = getShopProductById(id);
  if (!prod) return { success: false, error: 'Product not found' };

  const ip = await getClientIp();
  updateShopProduct(id, { isActive: !prod.isActive }, { id: current.user.id, email: current.user.email }, ip);

  revalidatePath('/shop');
  revalidatePath('/');
  revalidatePath('/admin/shop');
  revalidatePath('/admin/dashboard');

  return { success: true };
}
