import React from 'react';
import { getAdminUsers } from '@/lib/db';
import { requirePermission } from '@/lib/auth/guards';
import UsersManagerClient from '@/components/admin/UsersManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await requirePermission('manage_users');

  const users = getAdminUsers();

  return <UsersManagerClient initialUsers={users} currentUser={user} />;
}
