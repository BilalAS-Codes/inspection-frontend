import { NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware for route protection.
 * Redirects unauthenticated visitors attempting to access internal app pages to /login.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  const publicPrefixes = [
    '/login',
    '/verify',
    '/proposal',
    '/mock-pay',
    '/api',
    '/_next',
    '/favicon.ico',
    '/files'
  ];

  const isPublic = publicPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));

  const sessionCookie = request.cookies.get('invertio_session');

  // If internal route and no session cookie -> redirect to login
  if (!isPublic && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // If visiting /login while already logged in -> redirect to /dashboard
  if (pathname === '/login' && sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // If visiting root / -> redirect to /dashboard
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = sessionCookie ? '/dashboard' : '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
