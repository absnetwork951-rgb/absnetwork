import 'server-only';
import { getSupabaseAdmin } from './supabase-admin';
import { getPublicClient } from './supabase-public';
import type { CoverageArea } from './db/types';

/**
 * Supabase-backed Coverage Areas data layer.
 *
 *   Coverage areas -> `coverage_areas`
 *
 * Read strategy (mirrors supabase-cms.ts):
 *   * Public pages read rows through the publishable-key client, which is
 *     constrained by RLS (anon SELECT-only).
 *   * Admin pages and all writes use the service-role key (bypasses RLS).
 *
 * A coverage area either exists (shown on the public Home page) or does not
 * (deleted). There is no status/active toggle, no display order, and no slug.
 * If the `coverage_areas` table does not exist yet (migration not applied),
 * reads return `{ areas: [], error: true }` so the public page never crashes
 * and admins see a useful message instead of a raw Supabase error.
 */

export interface CoverageAreasResult {
  areas: CoverageArea[];
  error: boolean;
}

function mapCoverageArea(row: Record<string, any>): CoverageArea {
  return {
    id: String(row.id),
    city: String(row.city || ''),
    name: String(row.name || ''),
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  };
}

function toCoverageAreaColumns(input: { city?: string; name?: string }): Record<string, unknown> {
  return {
    city: String(input.city ?? '').trim(),
    name: String(input.name ?? '').trim(),
  };
}

/** Public reads via publishable RLS client; admin reads via service-role. */
export async function getSupabaseCoverageAreas(
  options: { admin?: boolean } = {}
): Promise<CoverageAreasResult> {
  const client = options.admin ? getSupabaseAdmin() : getPublicClient();
  if (!client) return { areas: [], error: false };
  const { data, error } = await client
    .from('coverage_areas')
    .select('*')
    .order('name');
  if (error) {
    console.error('[supabase-coverage] Failed to load coverage areas:', error.message);
    return { areas: [], error: true };
  }
  return {
    areas: ((data as Record<string, any>[] | null) ?? []).map(mapCoverageArea),
    error: false,
  };
}

export async function getSupabaseCoverageAreaById(id: string): Promise<CoverageArea | null> {
  const admin = getSupabaseAdmin() as any;
  if (!admin) return null;
  const { data, error } = await admin
    .from('coverage_areas')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load coverage area ${id}: ${error.message}`);
  }
  return data ? mapCoverageArea(data as Record<string, any>) : null;
}

/** Duplicate guard: does an area with the same name already exist in this city? */
export async function findSupabaseCoverageAreaByIdentity(
  city: string,
  name: string
): Promise<CoverageArea | null> {
  const admin = getSupabaseAdmin() as any;
  if (!admin) return null;
  const { data, error } = await admin
    .from('coverage_areas')
    .select('id, city, name, created_at, updated_at')
    .eq('city', String(city).trim())
    .ilike('name', String(name).trim())
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to find coverage area: ${error.message}`);
  }
  return data ? mapCoverageArea(data as Record<string, any>) : null;
}

export async function createSupabaseCoverageArea(
  data: { city: string; name: string }
): Promise<CoverageArea> {
  const admin = getSupabaseAdmin() as any;
  const { data: row, error } = await admin
    .from('coverage_areas')
    .insert(toCoverageAreaColumns(data))
    .select()
    .single();
  if (error) {
    throw new Error(`Failed to create coverage area: ${error.message}`);
  }
  return mapCoverageArea(row as Record<string, any>);
}

export async function updateSupabaseCoverageArea(
  id: string,
  updates: { city: string; name: string }
): Promise<CoverageArea | null> {
  const admin = getSupabaseAdmin() as any;
  const { data: row, error } = await admin
    .from('coverage_areas')
    .update(toCoverageAreaColumns(updates))
    .eq('id', id)
    .select()
    .single();
  if (error) {
    throw new Error(`Failed to update coverage area ${id}: ${error.message}`);
  }
  return row ? mapCoverageArea(row as Record<string, any>) : null;
}

export async function deleteSupabaseCoverageArea(id: string): Promise<boolean> {
  const admin = getSupabaseAdmin() as any;
  const { error } = await admin.from('coverage_areas').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete coverage area ${id}: ${error.message}`);
  }
  return true;
}