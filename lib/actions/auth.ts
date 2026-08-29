'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { authenticateAdmin, logoutAdmin, getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginActionResult = { success: boolean; error?: string };

export async function loginAction(
  _prev: LoginActionResult | null,
  formData: FormData
): Promise<LoginActionResult> {
  try {
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

    // Server-side redirect after the session cookies were set. Redirecting here
    // (rather than returning and letting the client do a window.location.replace)
    // ensures the browser applies the session Set-Cookie before following the
    // redirect, so the first authenticated navigation carries the cookie and the
    // middleware/page guards accept it. This avoids a login race in which the
    // client-side navigation fires before the cookie is committed, bouncing the
    // user back to /admin/login (and, with the middleware, a redirect loop).
    redirect('/admin/dashboard');
  } catch (error) {
    // Never leak internals; surface a safe, generic message instead.
    console.error('Login action error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during login. Please try again.',
    };
  }
}

export async function logoutAction() {
  await logoutAdmin();
  revalidatePath('/admin');
  redirect('/admin/login');
}
