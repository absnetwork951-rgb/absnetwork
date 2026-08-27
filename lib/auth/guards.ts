import { redirect, notFound } from 'next/navigation';
import { getCurrentSession } from './session';
import { hasPermission, type Permission } from './rbac';
import { type AdminUser } from '../db/types';

/**
 * Centralized authorization helpers (AUTH-001).
 * Every admin page and server action must go through these so permission
 * enforcement is uniform and cannot be accidentally omitted.
 */

export async function requireSession(): Promise<AdminUser> {
  const user = await getCurrentSession();
  if (!user) redirect('/admin/login');
  return user;
}

/**
 * Requires an authenticated session AND the given permission.
 * Returns the actor user on success; otherwise:
 *   - unauthenticated  -> redirect to /admin/login (307)
 *   - forbidden        -> 404 (notFound, per AUTH-003 fix: no existence leak,
 *                          documented as acceptable alternative to 403)
 */
export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const user = await requireSession();
  if (!hasPermission(user.role, permission)) {
    notFound();
  }
  return user;
}