import React from 'react';
import { getPackages } from '@/lib/db';
import { requirePermission } from '@/lib/auth/guards';
import PackagesManagerClient from '@/components/admin/PackagesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminPackagesPage() {
  const user = await requirePermission('manage_packages');

  const packages = getPackages();

  return <PackagesManagerClient initialPackages={packages} />;
}
