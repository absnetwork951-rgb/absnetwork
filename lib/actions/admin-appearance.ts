'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';
import { getAdminUserAppearance, updateAdminUserAppearance } from '../db';
import {
  type AdminAppearancePreferences,
  DEFAULT_ADMIN_APPEARANCE,
} from '../db/types';

const AppearanceSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']),
  accent: z.enum(['blue', 'indigo', 'violet', 'emerald', 'rose', 'amber']),
  density: z.enum(['comfortable', 'compact', 'spacious']),
  radius: z.enum(['none', 'sm', 'md', 'lg', 'xl']),
  motion: z.enum(['reduced', 'balanced', 'full']),
});

export type AppearanceActionResult = {
  success: boolean;
  error?: string;
  appearance?: AdminAppearancePreferences;
};

export async function getCurrentAppearance(): Promise<AdminAppearancePreferences> {
  const current = await getCurrentAdmin();
  if (!current) return DEFAULT_ADMIN_APPEARANCE;
  return getAdminUserAppearance(current.user.id);
}

export async function updateAppearanceAction(
  formData: FormData
): Promise<AppearanceActionResult> {
  const current = await getCurrentAdmin();
  if (!current) {
    return { success: false, error: 'Unauthorized: You must be signed in.' };
  }
  if (!hasPermission(current.user.role, 'manage_settings')) {
    return {
      success: false,
      error: 'Unauthorized: You do not have permission to manage settings.',
    };
  }

  const raw = {
    mode: formData.get('mode')?.toString() || 'system',
    accent: formData.get('accent')?.toString() || 'blue',
    density: formData.get('density')?.toString() || 'comfortable',
    radius: formData.get('radius')?.toString() || 'lg',
    motion: formData.get('motion')?.toString() || 'balanced',
  };

  const parsed = AppearanceSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid appearance selection.',
    };
  }

  const ip = await getClientIp();
  const updated = updateAdminUserAppearance(
    current.user.id,
    parsed.data,
    { id: current.user.id, email: current.user.email },
    ip
  );

  if (!updated) {
    return { success: false, error: 'Unable to save appearance preferences.' };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/admin/dashboard');

  return { success: true, appearance: updated };
}
