import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null | undefined;

/**
 * Lazily-created Supabase client bound to the PUBLISHABLE (anon) key for
 * PUBLIC, server-side reads.
 *
 * Public content tables (`packages`, `services`, `products`, ...) expose
 * SELECT policies for the `anon` / `authenticated` roles only, so this client
 * is the correct choice for public pages: the publishable key can never read
 * private rows (RLS) nor write anything.
 *
 * Returns `null` when environment variables are missing so callers can fail
 * soft (empty lists / defaults) instead of crashing public pages.
 */
export function getPublicClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error(
      '[supabase-public] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
    cached = null;
    return null;
  }

  cached = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cached;
}