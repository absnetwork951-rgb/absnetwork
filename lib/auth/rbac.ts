import { AdminRole } from '../db/types';

export type Permission =
  | 'manage_packages'
  | 'manage_services'
  | 'manage_shop_products'
  | 'manage_coverage_areas'
  | 'manage_orders'
  | 'manage_contact_submissions'
  | 'manage_users'
  | 'manage_settings'
  | 'view_security'
  | 'view_activity_logs';

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    'manage_packages',
    'manage_services',
    'manage_shop_products',
    'manage_coverage_areas',
    'manage_orders',
    'manage_contact_submissions',
    'manage_users',
    'manage_settings',
    'view_security',
    'view_activity_logs',
  ],
  ADMIN: [
    'manage_packages',
    'manage_services',
    'manage_shop_products',
    'manage_coverage_areas',
    'manage_orders',
    'manage_contact_submissions',
    'manage_users',
    'manage_settings',
    'view_activity_logs',
  ],
  CONTENT_MANAGER: [
    'manage_packages',
    'manage_services',
    'manage_shop_products',
    'manage_coverage_areas',
    'manage_settings',
    'view_activity_logs',
  ],
  SALES_MANAGER: [
    'manage_orders',
    'manage_contact_submissions',
    'view_activity_logs',
  ],
  SUPPORT_AGENT: [
    'manage_contact_submissions',
    'view_activity_logs',
  ],
  SECURITY_AUDITOR: [
    'view_security',
    'view_activity_logs',
  ],
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

export function canManageRole(actorRole: AdminRole, targetRole: AdminRole): boolean {
  if (actorRole === 'SUPER_ADMIN') return true;
  if (actorRole === 'ADMIN') {
    return targetRole !== 'SUPER_ADMIN' && targetRole !== 'ADMIN';
  }
  return false;
}
