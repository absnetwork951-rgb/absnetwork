import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cs = await cookies();
  const token = cs.get('abs_admin_session_token')?.value ?? null;
  const allCookieNames = cs.getAll().map((c) => c.name);
  const db = getDatabase();
  const session = token ? (db.sessions.find((s) => s.token === token) ?? null) : null;
  const user = session ? (db.users.find((u) => u.id === session.userId) ?? null) : null;
  return Response.json({
    names: allCookieNames,
    token,
    sessionsCount: db.sessions.length,
    sessionTokens: db.sessions.map((s) => s.token),
    sessionFound: !!session,
    sessionExpiresAt: session ? session.expiresAt : null,
    sessionExpired: session ? new Date(session.expiresAt).getTime() < Date.now() : null,
    userFound: !!user,
    userActive: user ? user.isActive : null,
  });
}