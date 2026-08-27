'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { authenticateAdmin, logoutAdmin, getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid login details',
    };
  }

  const result = await authenticateAdmin(parsed.data.email, parsed.data.password);
  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Authentication failed',
    };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function logoutAction() {
  await logoutAdmin();
  revalidatePath('/admin');
  return { success: true };
}
