import React from 'react';
import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth/guards';
import { getServiceById } from '@/lib/db';
import ServiceEditorFullPage from '@/components/admin/ServiceEditorFullPage';

export const dynamic = 'force-dynamic';

interface AdminEditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditServicePage({ params }: AdminEditServicePageProps) {
  const user = await requirePermission('manage_services');
  const { id } = await params;

  const service = getServiceById(id);

  if (!service) {
    notFound();
  }

  return <ServiceEditorFullPage initialService={service} actorRole={user.role} />;
}
