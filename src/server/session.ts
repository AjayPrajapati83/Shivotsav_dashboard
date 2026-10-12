import 'server-only';

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import type { Role } from '@/lib/types';

const COOKIE_NAME = 'shivotsav_session';

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export interface TokenPayload extends JWTPayload {
  role: Role;
}

/** Create a signed JWT and set it as an httpOnly cookie */
export async function createSession(role: Role): Promise<void> {
  const secret = getSecret();
  const token = await new SignJWT({ role } as TokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret);

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

/** Verify the JWT from cookies. Returns the payload or null. */
export async function verifySession(): Promise<TokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/** Get the current role, or null if not authenticated */
export async function getRole(): Promise<Role | null> {
  const session = await verifySession();
  return session?.role ?? null;
}

/** Require a specific role. Throws if unauthorized. */
export async function requireRole(role: Role): Promise<void> {
  const currentRole = await getRole();
  if (!currentRole) {
    throw new Error('UNAUTHORIZED');
  }
  if (role === 'admin' && currentRole !== 'admin') {
    throw new Error('FORBIDDEN');
  }
}

/** Destroy the session cookie */
export async function destroySession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
