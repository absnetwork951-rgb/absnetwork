import React from 'react';
import { getSiteSettings } from '@/lib/db';
import { requirePermission } from '@/lib/auth/guards';
import SettingsManagerClient from '@/components/admin/SettingsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const user = await requirePermission('manage_settings');

  const settings = getSiteSettings();

  return <SettingsManagerClient initialSettings={settings} />;
}
