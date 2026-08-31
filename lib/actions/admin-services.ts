'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';
import { logAudit } from '../db';
import {
  createSupabaseService,
  updateSupabaseService,
  deleteSupabaseService,
  getSupabaseServiceById,
} from '../supabase-cms';

const ServiceSchema = z.object({
  title: z.string().min(2, 'Service title is required'),
  slug: z.string().min(2, 'Slug is required'),
  shortDescription: z.string().min(10, 'Short description is required'),
  fullDescription: z.string().min(20, 'Full description is required'),
  iconName: z.string().default('Zap'),
  category: z.enum(['broadband', 'enterprise', 'it', 'cloud', 'support']),
  features: z.array(z.string()),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().default(1),
  badge: z.string().optional(),
});

export async function saveServiceAction(formData: FormData) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_services')) {
    return { success: false, error: 'Unauthorized: You do not have permission to manage services.' };
  }

  const id = formData.get('id')?.toString().trim();
  const rawFeatures = formData.get('features')?.toString() || '';
  const featuresList = rawFeatures.split('\n').map((f) => f.trim()).filter(Boolean);

  const rawData = {
    title: formData.get('title')?.toString().trim(),
    slug: formData.get('slug')?.toString().trim() || formData.get('title')?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    shortDescription: formData.get('shortDescription')?.toString().trim(),
    fullDescription: formData.get('fullDescription')?.toString().trim(),
    iconName: formData.get('iconName')?.toString().trim() || 'Zap',
    category: formData.get('category')?.toString() as any,
    features: featuresList,
    isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
    displayOrder: Number(formData.get('displayOrder')) || 1,
    badge: formData.get('badge')?.toString().trim() || undefined,
  };

  const parsed = ServiceSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  const ip = await getClientIp();

  let resServ;
  try {
    if (id) {
      resServ = await updateSupabaseService(id, parsed.data);
    } else {
      resServ = await createSupabaseService(parsed.data);
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save service',
    };
  }
  if (!resServ) {
    return { success: false, error: 'Service not found' };
  }

  logAudit(
    id ? 'ADMIN_UPDATED_SERVICE' : 'ADMIN_CREATED_SERVICE',
    'ServiceItem',
    resServ.id,
    { title: resServ.title, category: resServ.category },
    { id: current.user.id, email: current.user.email },
    ip
  );

  revalidatePath('/services');
  revalidatePath('/');
  revalidatePath('/admin/services');
  revalidatePath('/admin/dashboard');

  return { success: true, service: resServ };
}

export async function deleteServiceAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_services')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete services.' };
  }

  const ip = await getClientIp();

  let removedName = 'service';
  try {
    const existing = await getSupabaseServiceById(id);
    removedName = existing?.title ?? removedName;
    const ok = await deleteSupabaseService(id);
    if (!ok) return { success: false, error: 'Service not found' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete service',
    };
  }

  logAudit(
    'ADMIN_DELETED_SERVICE',
    'ServiceItem',
    id,
    { title: removedName },
    { id: current.user.id, email: current.user.email },
    ip
  );

  revalidatePath('/services');
  revalidatePath('/');
  revalidatePath('/admin/services');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function toggleServiceActiveAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_services')) {
    return { success: false, error: 'Unauthorized: You do not have permission to edit services.' };
  }

  const ip = await getClientIp();

  let updatedSrv;
  try {
    const srv = await getSupabaseServiceById(id);
    if (!srv) return { success: false, error: 'Service not found' };
    updatedSrv = await updateSupabaseService(id, { isActive: !srv.isActive });
    if (!updatedSrv) return { success: false, error: 'Service not found' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update service',
    };
  }

  logAudit(
    'ADMIN_UPDATED_SERVICE',
    'ServiceItem',
    id,
    { previousIsActive: !updatedSrv.isActive, isActive: updatedSrv.isActive },
    { id: current.user.id, email: current.user.email },
    ip
  );

  revalidatePath('/services');
  revalidatePath('/');
  revalidatePath('/admin/services');
  revalidatePath('/admin/dashboard');

  return { success: true };
}
