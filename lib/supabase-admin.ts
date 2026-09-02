import 'server-only'
import { createClient } from '@supabase/supabase-js'

let adminClient: ReturnType<typeof createClient> | null = null

/**
 * Server-side Supabase client bound to the SERVICE-ROLE key.
 * Bypasses RLS intentionally — this may ONLY be imported from server
 * components / server actions (enforced by the `server-only` package).
 *
 * Never expose this client or its key to the browser. The publishable-key
 * client in lib/supabase.ts is the only client allowed in client components.
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return adminClient
}

export const SUPABASE_STORAGE_BUCKET = 'product-images'