'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';
import { logAudit } from '../db';
import {
  createSupabasePackage,
  updateSupabasePackage,
  deleteSupabasePackage,
  getSupabasePackageById,
} from '../supabase-cms';

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
  try {
    if (id) {
      resPkg = await updateSupabasePackage(id, parsed.data);
    } else {
      resPkg = await createSupabasePackage(parsed.data);
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save package',
    };
  }
  if (!resPkg) {
    return { success: false, error: 'Package not found' };
  }

  logAudit(
    id ? 'ADMIN_UPDATED_PACKAGE' : 'ADMIN_CREATED_PACKAGE',
    'BroadbandPackage',
    resPkg.id,
    { name: resPkg.name, speedMbps: resPkg.speedMbps, pricePkr: resPkg.pricePkr },
    { id: current.user.id, email: current.user.email },
    ip
  );

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

  let removedId: string | undefined;
  let removedName = 'package';
  try {
    const existing = await getSupabasePackageById(id);
    removedId = existing?.id;
    removedName = existing?.name ?? removedName;
    const ok = await deleteSupabasePackage(id);
    if (!ok) return { success: false, error: 'Package not found' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete package',
    };
  }

  logAudit(
    'ADMIN_DELETED_PACKAGE',
    'BroadbandPackage',
    removedId,
    { name: removedName },
    { id: current.user.id, email: current.user.email },
    ip
  );

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

  const ip = await getClientIp();

  let updatedPkg;
  try {
    const pkg = await getSupabasePackageById(id);
    if (!pkg) return { success: false, error: 'Package not found' };
    updatedPkg = await updateSupabasePackage(id, { isActive: !pkg.isActive });
    if (!updatedPkg) return { success: false, error: 'Package not found' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update package',
    };
  }

  logAudit(
    'ADMIN_UPDATED_PACKAGE',
    'BroadbandPackage',
    id,
    { previousIsActive: !updatedPkg.isActive, isActive: updatedPkg.isActive },
    { id: current.user.id, email: current.user.email },
    ip
  );

  revalidatePath('/packages');
  revalidatePath('/');
  revalidatePath('/admin/packages');
  revalidatePath('/admin/dashboard');

  return { success: true };
}
