import React from 'react';
import { getSupabasePackages } from '@/lib/supabase-cms';
import { requirePermission } from '@/lib/auth/guards';
import PackagesManagerClient from '@/components/admin/PackagesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminPackagesPage() {
  const user = await requirePermission('manage_packages');

  const packages = await getSupabasePackages(false);

  return <PackagesManagerClient initialPackages={packages} />;
}
