import React from 'react';
import { getSupabaseCoverageAreas } from '@/lib/supabase-coverage';
import { requirePermission } from '@/lib/auth/guards';
import CoverageManagerClient from '@/components/admin/CoverageManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminCoveragePage() {
  const user = await requirePermission('manage_coverage_areas');

  const { areas } = await getSupabaseCoverageAreas({ admin: true });

  return <CoverageManagerClient initialAreas={areas} />;
}