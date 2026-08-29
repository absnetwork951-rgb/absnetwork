import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Keep these in sync with lib/supabase-auth.ts (single logical source).
const SB_ACCESS_COOKIE = 'abs_sb_access_token';
const SB_REFRESH_COOKIE = 'abs_sb_refresh_token';
const LEGACY_SESSION_COOKIE = 'abs_admin_session_token';

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const part = token.split('.')[1];
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(json) as { exp?: number };
    return payload && typeof payload.exp === 'number' ? payload : null;
  } catch {
    return null;
  }
}

function isExpired(payload: { exp?: number } | null): boolean {
  if (!payload || typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 < Date.now();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login');
  const method = request.method;

  const currentAccess = request.cookies.get(SB_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(SB_REFRESH_COOKIE)?.value;

  let response = NextResponse.next();
  let hasValidSession = !!currentAccess && !isExpired(decodeJwtPayload(currentAccess));

  // Refresh an expiring Supabase session using the refresh token (REST, no deps).
  if (!hasValidSession && refreshToken) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (url && anonKey) {
      try {
        const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
          method: 'POST',
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (res.ok) {
          const session = (await res.json()) as { access_token?: string; refresh_token?: string };
          if (session.access_token) {
            response = NextResponse.next();
            const secure = request.nextUrl.protocol === 'https:';
            response.cookies.set(SB_ACCESS_COOKIE, session.access_token, {
              httpOnly: true,
              secure,
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60,
            });
            if (session.refresh_token) {
              response.cookies.set(SB_REFRESH_COOKIE, session.refresh_token, {
                httpOnly: true,
                secure,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
              });
            }
            hasValidSession = true;
          }
        } else {
          // Refresh token dead: drop the stale cookies.
          response = NextResponse.next();
          response.cookies.delete(SB_ACCESS_COOKIE);
          response.cookies.delete(SB_REFRESH_COOKIE);
        }
      } catch {
        // Network hiccup with Supabase: leave cookies untouched; page-level
        // guards will still enforce authorization.
      }
    }
  }

  // Legacy bcrypt sessions are still supported for admins not yet linked to
  // Supabase Auth; their session cookie is a valid credential here too.
  const hasLegacySession = !!request.cookies.get(LEGACY_SESSION_COOKIE)?.value;
  const authenticated = hasValidSession || hasLegacySession;

  if (authenticated && isLoginPage && method === 'GET') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  if (!isLoginPage && method === 'GET' && !authenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return response;
}

export const config = {
  matcher: '/admin/:path*',
};