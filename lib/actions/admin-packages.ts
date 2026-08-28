'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';
import { createPackage, updatePackage, deletePackage } from '../db';

const PackageSchema = z.object({
  name: z.string().min(2, 'Package name is required'),
  slug: z.string().min(2, 'Slug is required'),
  category: z.enum(['residential', 'business', 'gaming', 'enterprise']),
  speedMbps: z.coerce.number().min(1, 'Speed must be at least 1 Mbps'),
  uploadSpeedMbps: z.coerce.number().optional(),
  pricePkr: z.coerce.number().min(0, 'Price must be positive'),
  priceType: z.enum(['fixed', 'contact']).optional(),
  priceLabel: z.string().optional(),
  billingPeriod: z.string().default('Monthly'),
  installationFeePkr: z.coerce.number().default(0),
  dataLimit: z.string().default('Truly Unlimited'),
  features: z.array(z.string()).or(z.string().transform((s) => s.split('\n').map((t) => t.trim()).filter(Boolean))),
  routerIncluded: z.boolean().default(true),
  routerDetails: z.string().optional(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().default(1),
});

export async function savePackageAction(formData: FormData) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_packages')) {
    return { success: false, error: 'Unauthorized: You do not have permission to manage packages.' };
  }

  const id = formData.get('id')?.toString().trim();
  const rawFeatures = formData.get('features')?.toString() || '';
  const featuresList = rawFeatures.split('\n').map((f) => f.trim()).filter(Boolean);
  const priceType: 'fixed' | 'contact' =
    formData.get('priceType') === 'contact' ? 'contact' : 'fixed';
  const rawPricePkr = Number(formData.get('pricePkr'));
  const rawPriceLabel = formData.get('priceLabel')?.toString().trim();
  const finalPricePkr = priceType === 'contact' ? 0 : rawPricePkr;

  const rawData = {
    name: formData.get('name')?.toString().trim(),
    slug: formData.get('slug')?.toString().trim() || formData.get('name')?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: formData.get('category')?.toString() as any,
    speedMbps: Number(formData.get('speedMbps')),
    uploadSpeedMbps: Number(formData.get('uploadSpeedMbps')) || Number(formData.get('speedMbps')),
    priceType,
    pricePkr: finalPricePkr,
    priceLabel:
      priceType === 'contact'
        ? 'Please contact us for rates.'
        : rawPriceLabel
          ? rawPriceLabel.toUpperCase().startsWith('PKR')
            ? rawPriceLabel
            : `PKR ${rawPriceLabel}`
          : `PKR ${finalPricePkr.toLocaleString()} + TAX`,
    billingPeriod: formData.get('billingPeriod')?.toString() || 'Monthly',
    installationFeePkr: Number(formData.get('installationFeePkr')) || 0,
    dataLimit: formData.get('dataLimit')?.toString() || 'Truly Unlimited',
    features: featuresList,
    routerIncluded: formData.get('routerIncluded') === 'true' || formData.get('routerIncluded') === 'on',
    routerDetails: formData.get('routerDetails')?.toString().trim() || undefined,
    isPopular: formData.get('isPopular') === 'true' || formData.get('isPopular') === 'on',
    isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
    displayOrder: Number(formData.get('displayOrder')) || 1,
  };

  const parsed = PackageSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  const ip = await getClientIp();

  let resPkg;
  if (id) {
    resPkg = updatePackage(id, parsed.data, { id: current.user.id, email: current.user.email }, ip);
  } else {
    resPkg = createPackage(parsed.data, { id: current.user.id, email: current.user.email }, ip);
  }

  revalidatePath('/packages');
  revalidatePath('/');
  revalidatePath('/admin/packages');
  revalidatePath('/admin/dashboard');

  return { success: true, package: resPkg };
}

export async function deletePackageAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_packages')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete packages.' };
  }

  const ip = await getClientIp();
  deletePackage(id, { id: current.user.id, email: current.user.email }, ip);

  revalidatePath('/packages');
  revalidatePath('/');
  revalidatePath('/admin/packages');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function togglePackageActiveAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_packages')) {
    return { success: false, error: 'Unauthorized: You do not have permission to edit packages.' };
  }

  const { getPackageById, updatePackage } = await import('../db');
  const pkg = getPackageById(id);
  if (!pkg) return { success: false, error: 'Package not found' };

  const ip = await getClientIp();
  updatePackage(id, { isActive: !pkg.isActive }, { id: current.user.id, email: current.user.email }, ip);

  revalidatePath('/packages');
  revalidatePath('/');
  revalidatePath('/admin/packages');
  revalidatePath('/admin/dashboard');

  return { success: true };
}
