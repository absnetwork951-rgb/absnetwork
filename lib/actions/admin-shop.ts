'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';
import { logAudit } from '../db';
import { getShopProductById } from '../supabase-shop';
import {
  createSupabaseShopProduct,
  updateSupabaseShopProduct,
  deleteSupabaseShopProduct,
  syncShopProductCount,
} from '../supabase-cms';

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

// The ShopManagerClient serializes images and specifications as JSON strings
// (FormData values), while older callers may still use newline-delimited text.
// Accept both so round-tripping through the editor never corrupts the data.
function parseListInput(value: string): string[] {
  const trimmed = (value || '').trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed)
        ? parsed.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
        : [];
    } catch {
      // fall through to newline parsing
    }
  }
  return trimmed
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseSpecificationsInput(value: string): Record<string, string> {
  const trimmed = (value || '').trim();
  if (!trimmed) return {};
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (k && v !== null && v !== undefined) {
          out[k] = typeof v === 'string' ? v : String(v);
        }
      }
      return out;
    } catch {
      // fall through to newline parsing
    }
  }
  const out: Record<string, string> = {};
  for (const line of trimmed.split('\n')) {
    const [k, ...rest] = line.split(':');
    if (k && rest.length) {
      out[k.trim()] = rest.join(':').trim();
    }
  }
  return out;
}

export async function saveShopProductAction(formData: FormData) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_shop_products')) {
    return { success: false, error: 'Unauthorized: You do not have permission to manage shop products.' };
  }

  const id = formData.get('id')?.toString().trim();
  const rawFeatures = formData.get('features')?.toString() || '';
  const featuresList = rawFeatures.split('\n').map((f) => f.trim()).filter(Boolean);

  const imagesList = parseListInput(formData.get('images')?.toString() || '');
  const specsObj = parseSpecificationsInput(
    formData.get('specifications')?.toString() || ''
  );

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
    images: imagesList,
    displayOrder: Number(formData.get('displayOrder')) || 1,
  };

  const parsed = ShopProductSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  const ip = await getClientIp();

  let resProd;
  try {
    if (id) {
      resProd = await updateSupabaseShopProduct(id, parsed.data);
    } else {
      resProd = await createSupabaseShopProduct(parsed.data);
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save product',
    };
  }
  if (!resProd) {
    return { success: false, error: 'Product not found' };
  }

  logAudit(
    id ? 'ADMIN_UPDATED_PRODUCT' : 'ADMIN_CREATED_PRODUCT',
    'ShopProduct',
    resProd.id,
    { name: resProd.name, category: resProd.category, pricePkr: resProd.pricePkr },
    { id: current.user.id, email: current.user.email },
    ip
  );

  try {
    await syncShopProductCount();
  } catch (syncErr) {
    console.error('[admin-shop] Failed to sync product count:', syncErr);
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

  let removedName = 'product';
  try {
    const existing = await getShopProductById(id);
    removedName = existing?.name ?? removedName;
    const ok = await deleteSupabaseShopProduct(id);
    if (!ok) return { success: false, error: 'Product not found' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete product',
    };
  }

  logAudit(
    'ADMIN_DELETED_PRODUCT',
    'ShopProduct',
    id,
    { name: removedName },
    { id: current.user.id, email: current.user.email },
    ip
  );

  try {
    await syncShopProductCount();
  } catch (syncErr) {
    console.error('[admin-shop] Failed to sync product count:', syncErr);
  }

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

  const ip = await getClientIp();

  let updatedProd;
  try {
    const prod = await getShopProductById(id);
    if (!prod) return { success: false, error: 'Product not found' };
    updatedProd = await updateSupabaseShopProduct(id, { isActive: !prod.isActive });
    if (!updatedProd) return { success: false, error: 'Product not found' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update product',
    };
  }

  logAudit(
    'ADMIN_UPDATED_PRODUCT',
    'ShopProduct',
    id,
    { previousIsActive: !updatedProd.isActive, isActive: updatedProd.isActive },
    { id: current.user.id, email: current.user.email },
    ip
  );

  try {
    await syncShopProductCount();
  } catch (syncErr) {
    console.error('[admin-shop] Failed to sync product count:', syncErr);
  }

  revalidatePath('/shop');
  revalidatePath('/');
  revalidatePath('/admin/shop');
  revalidatePath('/admin/dashboard');

  return { success: true };
}