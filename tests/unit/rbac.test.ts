import { describe, it, expect } from 'vitest';
import {
  ROLE_PERMISSIONS,
  hasPermission,
  canManageRole,
  Permission,
} from '@/lib/auth/rbac';
import type { AdminRole } from '@/lib/db/types';

const ADMIN_ROLES = Object.keys(ROLE_PERMISSIONS) as AdminRole[];
const ALL_PERMISSIONS: Permission[] = [
  'manage_packages',
  'manage_services',
  'manage_shop_products',
  'manage_orders',
  'manage_contact_submissions',
  'manage_users',
  'manage_settings',
  'view_security',
  'view_activity_logs',
];

describe('RBAC permission matrix', () => {
  it('SUPER_ADMIN has all 9 permissions', () => {
    for (const perm of ALL_PERMISSIONS) {
      expect(hasPermission('SUPER_ADMIN', perm)).toBe(true);
    }
  });

  it('ADMIN has every permission except view_security', () => {
    for (const perm of ALL_PERMISSIONS) {
      expect(hasPermission('ADMIN', perm)).toBe(perm !== 'view_security');
    }
  });

  it('SECURITY_AUDITOR only has view_security + view_activity_logs', () => {
    for (const perm of ALL_PERMISSIONS) {
      const expected =
        perm === 'view_security' || perm === 'view_activity_logs';
      expect(hasPermission('SECURITY_AUDITOR', perm)).toBe(expected);
    }
  });

  it('every defined role maps to a permission list', () => {
    for (const role of ADMIN_ROLES) {
      const perms = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
      expect(Array.isArray(perms)).toBe(true);
      expect(perms!.length).toBeGreaterThan(0);
    }
  });

  it('unknown role or permission never grants access', () => {
    // @ts-expect-error - intentionally invalid input
    expect(hasPermission('GHOST_ROLE', 'manage_packages')).toBe(false);
    // @ts-expect-error - intentionally invalid input
    expect(hasPermission('SUPER_ADMIN', 'ghost_permission')).toBe(false);
  });
});

describe('canManageRole hierarchy', () => {
  it('SUPER_ADMIN can manage every other role', () => {
    for (const role of ADMIN_ROLES) {
      if (role === 'SUPER_ADMIN') continue;
      expect(canManageRole('SUPER_ADMIN', role)).toBe(true);
    }
  });

  it('ADMIN can manage lower roles but never SUPER_ADMIN', () => {
    expect(canManageRole('ADMIN', 'SUPER_ADMIN')).toBe(false);
    expect(canManageRole('ADMIN', 'CONTENT_MANAGER')).toBe(true);
    expect(canManageRole('ADMIN', 'SALES_MANAGER')).toBe(true);
    expect(canManageRole('ADMIN', 'SUPPORT_AGENT')).toBe(true);
    expect(canManageRole('ADMIN', 'SECURITY_AUDITOR')).toBe(true);
  });

  it('equal roles cannot manage each other', () => {
    expect(canManageRole('ADMIN', 'ADMIN')).toBe(false);
    expect(canManageRole('SALES_MANAGER', 'SALES_MANAGER')).toBe(false);
  });
});