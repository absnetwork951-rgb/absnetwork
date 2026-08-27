import React from 'react';
import { getServices } from '@/lib/db';
import { requirePermission } from '@/lib/auth/guards';
import ServicesManagerClient from '@/components/admin/ServicesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
  const user = await requirePermission('manage_services');

  const services = getServices();

  return <ServicesManagerClient initialServices={services} />;
}
