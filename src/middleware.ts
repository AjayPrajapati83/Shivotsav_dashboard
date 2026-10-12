import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'shivotsav_session';

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return new TextEncoder().encode('fallback-dev-secret-change-me!!');
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public assets, API routes for login/logout, and _next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/logout') ||
    pathname.startsWith('/logos') ||
    pathname.startsWith('/sponsors') ||
    pathname.startsWith('/crests') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|woff|woff2|ttf|mp4|webm)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Login page: redirect if already authenticated
  if (pathname === '/login') {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, getSecret());
        const role = payload.role as string;
        if (role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
      } catch {
        // Invalid token, show login page
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string;

    // CL trying to access admin
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid/expired token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
