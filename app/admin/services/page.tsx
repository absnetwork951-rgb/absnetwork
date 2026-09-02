import React from 'react';
import { requirePermission } from '@/lib/auth/guards';
import { getServices } from '@/lib/db';
import ServicesManagerClient from '@/components/admin/ServicesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
  const user = await requirePermission('manage_services');

  const services = getServices(false);

  return <ServicesManagerClient initialServices={services} actorRole={user.role} />;
}
