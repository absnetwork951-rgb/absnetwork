import React from 'react';
import { getContactSubmissions } from '@/lib/db';
import { requirePermission } from '@/lib/auth/guards';
import SubmissionsManagerClient from '@/components/admin/SubmissionsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminSubmissionsPage() {
  const user = await requirePermission('manage_contact_submissions');

  const submissions = getContactSubmissions();

  return <SubmissionsManagerClient initialSubmissions={submissions} />;
}
