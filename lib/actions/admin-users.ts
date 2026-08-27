'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentAdmin, getClientIp, hashPassword } from '../auth/session';
import { hasPermission, canManageRole } from '../auth/rbac';
import {
  createAdminUser,
  updateAdminUser,
  getAdminUserById,
  revokeAllUserSessions,
  logSecurityEvent,
  logAudit,
} from '../db';
import { AdminRole } from '../db/types';

const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum([
    'SUPER_ADMIN',
    'ADMIN',
    'CONTENT_MANAGER',
    'SALES_MANAGER',
    'SUPPORT_AGENT',
    'SECURITY_AUDITOR',
  ]),
});

export async function createAdminUserAction(formData: FormData) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_users')) {
    return { success: false, error: 'Unauthorized: Permission denied.' };
  }

  const role = formData.get('role')?.toString() as AdminRole;
  if (!canManageRole(current.user.role, role)) {
    return { success: false, error: `You do not have privilege to create a ${role} account.` };
  }

  const rawData = {
    name: formData.get('name')?.toString().trim(),
    email: formData.get('email')?.toString().trim().toLowerCase(),
    password: formData.get('password')?.toString(),
    role,
  };

  const parsed = CreateUserSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  const ip = await getClientIp();
  const passwordHash = await hashPassword(parsed.data.password);

  try {
    createAdminUser(
      {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role,
      },
      { id: current.user.id, email: current.user.email },
      ip
    );

    revalidatePath('/admin/users');
    revalidatePath('/admin/security');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create user' };
  }
}

export async function updateUserRoleAndStatusAction(
  userId: string,
  newRole?: AdminRole,
  isActive?: boolean
) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_users')) {
    return { success: false, error: 'Unauthorized.' };
  }

  const targetUser = getAdminUserById(userId);
  if (!targetUser) {
    return { success: false, error: 'User not found.' };
  }

  // Prevent editing super admins if not super admin
  if (targetUser.role === 'SUPER_ADMIN' && current.user.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Cannot modify Super Admin accounts.' };
  }

  // Prevent users from deactivating themselves
  if (userId === current.user.id && isActive === false) {
    return { success: false, error: 'You cannot disable your own active account.' };
  }

  if (newRole && !canManageRole(current.user.role, newRole)) {
    return { success: false, error: 'Cannot grant privileges higher than your authority.' };
  }

  const ip = await getClientIp();
  updateAdminUser(
    userId,
    {
      ...(newRole ? { role: newRole } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
    { id: current.user.id, email: current.user.email },
    ip
  );

  if (isActive === false) {
    revokeAllUserSessions(userId, { id: current.user.id, email: current.user.email }, ip);
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function resetUserPasswordAction(userId: string, newPass: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_users')) {
    return { success: false, error: 'Unauthorized.' };
  }

  if (newPass.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  const targetUser = getAdminUserById(userId);
  if (!targetUser) return { success: false, error: 'User not found.' };

  if (targetUser.role === 'SUPER_ADMIN' && current.user.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Cannot reset password for Super Admin.' };
  }

  const ip = await getClientIp();
  const passwordHash = await hashPassword(newPass);

  updateAdminUser(
    userId,
    { passwordHash },
    { id: current.user.id, email: current.user.email },
    ip
  );

  revokeAllUserSessions(userId, { id: current.user.id, email: current.user.email }, ip);

  logSecurityEvent(
    'PASSWORD_CHANGED',
    'WARNING',
    `Password reset by admin ${current.user.email} for user ${targetUser.email}`,
    { id: current.user.id, email: current.user.email },
    ip
  );

  revalidatePath('/admin/users');
  return { success: true };
}

export async function resetPasswordAction(userId: string, newPass: string) {
  return resetUserPasswordAction(userId, newPass);
}

export async function updateAdminUserAction(formData: FormData) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_users')) {
    return { success: false, error: 'Unauthorized.' };
  }

  const id = formData.get('id')?.toString().trim();
  if (!id) return { success: false, error: 'User ID is required' };

  const fullName = formData.get('fullName')?.toString().trim();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const role = formData.get('role')?.toString() as AdminRole;
  const isActive = formData.get('isActive') === 'true' || formData.get('isActive') === 'on';

  const { getAdminUserById, updateAdminUser } = await import('../db');
  const targetUser = getAdminUserById(id);
  if (!targetUser) return { success: false, error: 'User not found' };

  if (targetUser.role === 'SUPER_ADMIN' && current.user.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Cannot modify Super Admin accounts.' };
  }

  if (role && !canManageRole(current.user.role, role)) {
    return { success: false, error: 'Cannot grant privileges higher than your authority.' };
  }

  const ip = await getClientIp();
  updateAdminUser(
    id,
    {
      ...(fullName ? { fullName } : {}),
      ...(email ? { email } : {}),
      ...(role ? { role } : {}),
      isActive,
    },
    { id: current.user.id, email: current.user.email },
    ip
  );

  revalidatePath('/admin/users');
  return { success: true };
}

export async function deleteAdminUserAction(userId: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_users')) {
    return { success: false, error: 'Unauthorized.' };
  }

  const { getAdminUserById, deleteAdminUser } = await import('../db');
  const targetUser = getAdminUserById(userId);
  if (!targetUser) return { success: false, error: 'User not found' };

  if (targetUser.role === 'SUPER_ADMIN') {
    return { success: false, error: 'Super Admin cannot be deleted.' };
  }

  const ip = await getClientIp();
  deleteAdminUser(userId, { id: current.user.id, email: current.user.email }, ip);

  revalidatePath('/admin/users');
  return { success: true };
}
