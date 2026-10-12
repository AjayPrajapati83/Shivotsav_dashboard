import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ACCOUNTS } from '@/server/credentials';
import { createSession } from '@/server/session';
import crypto from 'crypto';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// Simple in-memory rate limiter
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(ip)) {
    // Artificial delay
    await new Promise((r) => setTimeout(r, 2000));
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Find account (case-insensitive email)
    const account = ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );

    if (!account) {
      // Artificial delay to prevent timing attacks (reduced to 200ms for better UX)
      await new Promise((r) => setTimeout(r, 200));
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Timing-safe password comparison
    const inputBuf = Buffer.from(password);
    const storedBuf = Buffer.from(account.password);

    // Pad to equal length for timingSafeEqual
    const maxLen = Math.max(inputBuf.length, storedBuf.length);
    const paddedInput = Buffer.alloc(maxLen);
    const paddedStored = Buffer.alloc(maxLen);
    inputBuf.copy(paddedInput);
    storedBuf.copy(paddedStored);

    const match =
      inputBuf.length === storedBuf.length &&
      crypto.timingSafeEqual(paddedInput, paddedStored);

    if (!match) {
      await new Promise((r) => setTimeout(r, 200));
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    await createSession(account.role);

    return NextResponse.json({
      role: account.role,
      redirectTo: account.role === 'admin' ? '/admin' : '/',
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 400 }
    );
  }
}
