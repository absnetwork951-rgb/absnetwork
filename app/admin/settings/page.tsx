import React from 'react';
import { getSupabaseSettings } from '@/lib/supabase-cms';
import { requirePermission } from '@/lib/auth/guards';
import SettingsManagerClient from '@/components/admin/SettingsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const user = await requirePermission('manage_settings');

  const settings = await getSupabaseSettings();

  return <SettingsManagerClient initialSettings={settings} />;
}
