import React from 'react';
import { requirePermission } from '@/lib/auth/guards';
import ServiceEditorFullPage from '@/components/admin/ServiceEditorFullPage';

export const dynamic = 'force-dynamic';

export default async function AdminNewServicePage() {
  const user = await requirePermission('manage_services');

  return <ServiceEditorFullPage initialService={null} actorRole={user.role} />;
}
