import { describe, it, expect } from 'vitest';
import { getAdminUserBySupabaseUserId } from '@/lib/db';
import { getAdminUsers } from '@/lib/db';
import { hasPermission } from '@/lib/auth/rbac';

const TARGET_SUPABASE_UUID = '32a4f677-0c9f-418a-9b95-ef0c3368f0a0';

describe('Supabase Auth -> admin RBAC resolution (server-side only)', () => {
  it('resolves the target Supabase Auth user to a single SUPER_ADMIN record', () => {
    const admin = getAdminUserBySupabaseUserId(TARGET_SUPABASE_UUID);
    expect(admin).toBeDefined();
    expect(admin!.role).toBe('SUPER_ADMIN');
    expect(admin!.isActive).toBe(true);
    expect(admin!.email).toBe('absnetwork951@gmail.com');
  });

  it('no other admin is linked to the same Supabase Auth user', () => {
    const linked = getAdminUsers().filter(
      (u) => u.authUserId === TARGET_SUPABASE_UUID
    );
    expect(linked).toHaveLength(1);
  });

  it('an unknown Supabase Auth UUID resolves to no admin', () => {
    expect(
      getAdminUserBySupabaseUserId('00000000-0000-0000-0000-000000000000')
    ).toBeUndefined();
  });

  it('the resolved SUPER_ADMIN retains every server-side permission', () => {
    const permissions = [
      'manage_packages',
      'manage_services',
      'manage_shop_products',
      'manage_orders',
      'manage_contact_submissions',
      'manage_users',
      'manage_settings',
      'view_security',
      'view_activity_logs',
    ] as const;
    for (const perm of permissions) {
      expect(hasPermission('SUPER_ADMIN', perm)).toBe(true);
    }
  });
});