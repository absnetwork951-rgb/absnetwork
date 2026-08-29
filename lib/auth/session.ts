import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import {
  getAdminUserWithHash,
  getAdminUserBySupabaseUserId,
  createSession,
  getSession,
  revokeSession,
  logSecurityEvent,
  logAudit,
} from '../db';
import { AdminUser } from '../db/types';
import {
  SUPABASE_ACCESS_COOKIE,
  SUPABASE_REFRESH_COOKIE,
  SUPABASE_SESSION_MAX_AGE_SECONDS,
  supabaseSignIn,
  getSupabaseUserIdFromToken,
  revokeSupabaseSession,
  resolveAdminBySupabaseUserId,
} from '../supabase-auth';

export const SESSION_COOKIE_NAME = 'abs_admin_session_token';

// Rate limiting in-memory map
const loginAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headerList.get('x-real-ip') || '127.0.0.1';
}

export async function getUserAgent(): Promise<string> {
  const headerList = await headers();
  return headerList.get('user-agent') || 'Unknown';
}

export async function isSecureRequest(): Promise<boolean> {
  const headerList = await headers();
  const proto = headerList.get('x-forwarded-proto');
  if (proto) return proto.split(',')[0].trim().toLowerCase() === 'https';
  return headerList.get('x-forwarded-host')?.includes('https') ?? false;
}

export function checkRateLimit(
  identifier: string,
  limit = 5
): { allowed: boolean; remainingSecs?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);

  if (!entry) {
    return { allowed: true };
  }

  if (entry.lockedUntil && entry.lockedUntil > now) {
    return {
      allowed: false,
      remainingSecs: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }

  // Reset after 15 minutes window
  if (now - entry.firstAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(identifier);
    return { allowed: true };
  }

  if (entry.count >= limit) {
    // Lock for 15 minutes
    entry.lockedUntil = now + 15 * 60 * 1000;
    return {
      allowed: false,
      remainingSecs: 15 * 60,
    };
  }

  return { allowed: true };
}

/**
 * IP-wide cap (SEC hardening): credential stuffing across many accounts from a
 * single IP must also be throttled, independent of per-account limits.
 * Threshold is intentionally higher (20/15min) so a shared office/PAT gateway
 * isn't locked out by a few account-specific failures.
 */
export function checkIpRateLimit(ip: string): { allowed: boolean; remainingSecs?: number } {
  return checkRateLimit(`ip:${ip}`, 20);
}

export function recordIpFailedAttempt(ip: string) {
  recordFailedAttempt(`ip:${ip}`);
}

export function recordFailedAttempt(identifier: string) {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);
  if (!entry) {
    loginAttempts.set(identifier, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
  }
}

export function resetRateLimit(identifier: string) {
  loginAttempts.delete(identifier);
}

export async function authenticateAdmin(email: string, pass: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  const ip = await getClientIp();
  const rateKey = `${email.toLowerCase()}_${ip}`;
  const rate = checkRateLimit(rateKey);
  const ipRate = checkIpRateLimit(ip);

  if (!rate.allowed) {
    logSecurityEvent(
      'RATE_LIMITED',
      'WARNING',
      `Too many failed login attempts for ${email} from IP ${ip}`,
      undefined,
      ip
    );
    return {
      success: false,
      error: `Too many login attempts. Please wait ${rate.remainingSecs || 900} seconds before trying again.`,
    };
  }

  if (!ipRate.allowed) {
    logSecurityEvent(
      'RATE_LIMITED',
      'CRITICAL',
      `Suspected credential stuffing: sustained failed logins from IP ${ip}`,
      undefined,
      ip
    );
    return {
      success: false,
      error: `Too many login attempts. Please wait ${ipRate.remainingSecs || 900} seconds before trying again.`,
    };
  }

  const legacyUser = getAdminUserWithHash(email);

  // Supabase-linked admin: Supabase Auth is the source of truth. For a linked
  // account we never fall through to the legacy bcrypt path — a wrong password
  // must not authenticate through a stale legacy hash.
  if (legacyUser?.authUserId) {
    const sb = await supabaseSignIn(email, pass);
    if (!sb.ok) {
      recordFailedAttempt(rateKey);
      recordIpFailedAttempt(ip);
      logSecurityEvent(
        'LOGIN_FAILED',
        'WARNING',
        `Invalid password attempt (Supabase Auth) for account: ${email}`,
        { id: legacyUser.id, email: legacyUser.email },
        ip
      );
      return { success: false, error: 'Invalid email or password.' };
    }

    const admin = resolveAdminBySupabaseUserId(sb.userId);
    if (!admin) {
      recordFailedAttempt(rateKey);
      recordIpFailedAttempt(ip);
      logSecurityEvent(
        'UNAUTHORIZED_ACCESS',
        'WARNING',
        `Authenticated Supabase user ${email} is not linked to any admin account.`,
        { id: sb.userId },
        ip
      );
      return { success: false, error: 'This account is not authorized to access the admin panel.' };
    }

    if (!admin.isActive) {
      recordFailedAttempt(rateKey);
      recordIpFailedAttempt(ip);
      logSecurityEvent(
        'LOGIN_FAILED',
        'WARNING',
        `Login attempt for disabled account: ${email}`,
        { id: admin.id, email: admin.email },
        ip
      );
      return { success: false, error: 'This account is disabled. Contact an administrator.' };
    }

    resetRateLimit(rateKey);
    const cookieStore = await cookies();
    const secure = await isSecureRequest();
    cookieStore.set(SUPABASE_ACCESS_COOKIE, sb.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // access token TTL; proxy refreshes via refresh token
    });
    cookieStore.set(SUPABASE_REFRESH_COOKIE, sb.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: SUPABASE_SESSION_MAX_AGE_SECONDS,
    });

    logSecurityEvent(
      'LOGIN_SUCCESS',
      'INFO',
      `User ${admin.email} (${admin.role}) signed in via Supabase Auth.`,
      { id: admin.id, email: admin.email },
      ip,
      { supabaseUserId: sb.userId }
    );
    logAudit(
      'ADMIN_LOGIN',
      'SupabaseSession',
      sb.userId,
      { role: admin.role, provider: 'supabase' },
      { id: admin.id, email: admin.email },
      ip
    );

    const { passwordHash, ...safeUser } = admin;
    return { success: true, user: { ...safeUser, passwordHash: '' } };
  }

  const user = legacyUser;
  if (!user || !user.isActive) {
    recordFailedAttempt(rateKey);
    recordIpFailedAttempt(ip);
    logSecurityEvent(
      'LOGIN_FAILED',
      'WARNING',
      `Failed login attempt for non-existent or disabled account: ${email}`,
      undefined,
      ip
    );
    return { success: false, error: 'Invalid email or password.' };
  }

  const isMatch = await verifyPassword(pass, user.passwordHash);
  if (!isMatch) {
    recordFailedAttempt(rateKey);
    recordIpFailedAttempt(ip);
    logSecurityEvent(
      'LOGIN_FAILED',
      'WARNING',
      `Invalid password attempt for account: ${email}`,
      { id: user.id, email: user.email },
      ip
    );
    return { success: false, error: 'Invalid email or password.' };
  }

  // Success
  resetRateLimit(rateKey);
  const userAgent = await getUserAgent();
  const session = createSession(user.id, ip, userAgent);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.token, {
    httpOnly: true,
    secure: await isSecureRequest(),
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  logSecurityEvent(
    'LOGIN_SUCCESS',
    'INFO',
    `User ${user.email} (${user.role}) logged in successfully.`,
    { id: user.id, email: user.email },
    ip
  );

  logAudit(
    'ADMIN_LOGIN',
    'AdminSession',
    session.id,
    { role: user.role },
    { id: user.id, email: user.email },
    ip
  );

  const { passwordHash, ...safeUser } = user;
  return { success: true, user: { ...safeUser, passwordHash: '' } };
}

export async function getCurrentAdmin(): Promise<{ user: AdminUser; token: string } | null> {
  const cookieStore = await cookies();

  // Supabase-first: validate the access token(signature+expiry) against
  // Supabase Auth, then resolve the admin role from the on-disk store.
  const sbAccessToken = cookieStore.get(SUPABASE_ACCESS_COOKIE)?.value;
  if (sbAccessToken) {
    try {
      const userId = await getSupabaseUserIdFromToken(sbAccessToken);
      const sbUser = userId ? resolveAdminBySupabaseUserId(userId) : undefined;
      if (sbUser && sbUser.isActive) {
        const { passwordHash, ...safeUser } = sbUser;
        return { user: { ...safeUser, passwordHash: '' }, token: sbAccessToken };
      }
      return null;
    } catch {
      // Missing/misconfigured Supabase env: fall through to legacy path.
    }
  }

  // Legacy bcrypt-session fallback (admins not yet linked to Supabase Auth).
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const result = getSession(token);
  if (!result) return null;

  const { passwordHash, ...safeUser } = result.user;
  return {
    user: { ...safeUser, passwordHash: '' },
    token,
  };
}

export async function getCurrentSession(): Promise<AdminUser | null> {
  const current = await getCurrentAdmin();
  return current ? current.user : null;
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const sbAccessToken = cookieStore.get(SUPABASE_ACCESS_COOKIE)?.value;
  const ip = await getClientIp();

  // Supabase session: revoke the refresh token server-side, then clear cookies.
  if (sbAccessToken) {
    const admin = resolveAdminBySupabaseUserId((await getSupabaseUserIdFromToken(sbAccessToken)) || '');
    await revokeSupabaseSession(sbAccessToken);
    cookieStore.delete(SUPABASE_ACCESS_COOKIE);
    cookieStore.delete(SUPABASE_REFRESH_COOKIE);
    if (admin) {
      logSecurityEvent(
        'LOGOUT',
        'INFO',
        `User ${admin.email} (${admin.role}) logged out.`,
        { id: admin.id, email: admin.email },
        ip,
        { provider: 'supabase' }
      );
      logAudit(
        'ADMIN_LOGOUT',
        'SupabaseSession',
        undefined,
        {},
        { id: admin.id, email: admin.email },
        ip
      );
    }
    return;
  }

  // Legacy bcrypt session.
  const current = await getCurrentAdmin();
  if (current) {
    revokeSession(current.token, { id: current.user.id, email: current.user.email }, ip);
    logSecurityEvent(
      'LOGOUT',
      'INFO',
      `User ${current.user.email} logged out.`,
      { id: current.user.id, email: current.user.email },
      ip
    );
    logAudit(
      'ADMIN_LOGOUT',
      'AdminSession',
      undefined,
      {},
      { id: current.user.id, email: current.user.email },
      ip
    );
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
