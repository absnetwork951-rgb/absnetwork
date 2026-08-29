import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { getAdminUserBySupabaseUserId } from './db'
import type { AdminUser } from './db/types'

export const SUPABASE_ACCESS_COOKIE = 'abs_sb_access_token'
export const SUPABASE_REFRESH_COOKIE = 'abs_sb_refresh_token'

export const SUPABASE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days (refresh token TTL)

/**
 * Server-only Supabase Auth helpers.
 *
 * Authentication source of truth: Supabase Auth (password). RBAC source of
 * truth: the on-disk `admin_users` store (`lib/db`), resolved by
 * `authUserId` — never from any client-controlled value.
 *
 * The publishable/anon key client below is safe for server-side sign-in,
 * token verification and token refresh. The service-role key never leaves
 * the server and is NOT used for any user-authentication path.
 */

function createAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!supabasePublishableKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export type SupabaseSignInResult =
  | { ok: true; accessToken: string; refreshToken: string; userId: string }
  | { ok: false; error: string }

export async function supabaseSignIn(email: string, password: string): Promise<SupabaseSignInResult> {
  const { data, error } = await createAuthClient().auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return { ok: false, error: error?.message || 'Authentication failed.' }
  }

  return {
    ok: true,
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    userId: data.user.id,
  }
}

/** Validates an access token against Supabase and returns the Auth user UUID (null when invalid). */
export async function getSupabaseUserIdFromToken(accessToken: string): Promise<string | null> {
  if (!accessToken) return null
  const { data, error } = await createAuthClient().auth.getUser(accessToken)
  if (error || !data.user) return null
  return data.user.id
}

/** Exchanges a refresh token for a fresh session; returns null when the token is invalid/expired. */
export async function refreshSupabaseSession(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  userId: string
} | null> {
  if (!refreshToken) return null
  const { data, error } = await createAuthClient().auth.refreshSession({ refresh_token: refreshToken })
  if (error || !data.session || !data.user) return null
  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    userId: data.user.id,
  }
}

/** Best-effort server-side logout: revokes the Supabase refresh token. */
export async function revokeSupabaseSession(accessToken: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !supabasePublishableKey || !accessToken) return
  try {
    await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${accessToken}`,
      },
    })
  } catch {
    // Logout is best-effort; local cookies are always cleared regardless.
  }
}

/** Resolves the on-disk admin account linked to a Supabase Auth user UUID. */
export function resolveAdminBySupabaseUserId(userId: string): AdminUser | undefined {
  return getAdminUserBySupabaseUserId(userId)
}