'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';
import { logAudit } from '../db';
import {
  getSupabaseCoverageAreaById,
  findSupabaseCoverageAreaByIdentity,
  createSupabaseCoverageArea,
  updateSupabaseCoverageArea,
  deleteSupabaseCoverageArea,
} from '../supabase-coverage';

const CoverageAreaSchema = z.object({
  city: z.string().trim().min(1, 'City is required'),
  name: z.string().trim().min(1, 'Area name is required'),
});

const DUPLICATE_MESSAGE = 'An area with this name already exists in this city.';

export async function saveCoverageAreaAction(formData: FormData) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_coverage_areas')) {
    return { success: false, error: 'Unauthorized: You do not have permission to manage coverage areas.' };
  }

  const id = formData.get('id')?.toString().trim() ?? '';
  const parsed = CoverageAreaSchema.safeParse({
    city: formData.get('city')?.toString() ?? '',
    name: formData.get('name')?.toString() ?? '',
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  // Duplicate guard (mirrors the unique (city, name) constraint at the DB
  // level). The same city + area name must never be inserted twice.
  try {
    const existing = await findSupabaseCoverageAreaByIdentity(parsed.data.city, parsed.data.name);
    if (existing && existing.id !== id) {
      return { success: false, error: DUPLICATE_MESSAGE };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to validate coverage area',
    };
  }

  const ip = await getClientIp();

  let resArea;
  try {
    if (id) {
      resArea = await updateSupabaseCoverageArea(id, parsed.data);
    } else {
      resArea = await createSupabaseCoverageArea(parsed.data);
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save coverage area',
    };
  }
  if (!resArea) {
    return { success: false, error: 'Coverage area not found' };
  }

  logAudit(
    id ? 'ADMIN_UPDATED_COVERAGE_AREA' : 'ADMIN_CREATED_COVERAGE_AREA',
    'CoverageArea',
    resArea.id,
    { city: resArea.city, name: resArea.name },
    { id: current.user.id, email: current.user.email },
    ip
  );

  revalidatePath('/');
  revalidatePath('/admin/coverage');

  return { success: true, area: resArea };
}

export async function deleteCoverageAreaAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_coverage_areas')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete coverage areas.' };
  }

  const ip = await getClientIp();

  let removedName = 'coverage area';
  let removedCity = '';
  try {
    const existing = await getSupabaseCoverageAreaById(id);
    removedName = existing?.name ?? removedName;
    removedCity = existing?.city ?? removedCity;
    const ok = await deleteSupabaseCoverageArea(id);
    if (!ok) return { success: false, error: 'Coverage area not found' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete coverage area',
    };
  }

  logAudit(
    'ADMIN_DELETED_COVERAGE_AREA',
    'CoverageArea',
    id,
    { city: removedCity, name: removedName },
    { id: current.user.id, email: current.user.email },
    ip
  );

  revalidatePath('/');
  revalidatePath('/admin/coverage');

  return { success: true };
}