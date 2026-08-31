import React from 'react';
import { requirePermission } from '@/lib/auth/guards';
import { getSupabaseSettings } from '@/lib/supabase-cms';
import SettingsManagerClient from '@/components/admin/SettingsManagerClient';
import AppearanceManager from '@/components/admin/AppearanceManager';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requirePermission('manage_settings');

  const settings = await getSupabaseSettings();

  return (
    <div className="space-y-10">
      <SettingsManagerClient initialSettings={settings} />
      <div className="border-t border-slate-200 pt-10">
        <AppearanceManager />
      </div>
    </div>
  );
}
