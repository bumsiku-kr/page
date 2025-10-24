import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // JWT authentication check
  // Note: Next.js middleware runs on edge runtime and cannot access localStorage
  // The actual token validation happens in React components using useEffect
  // This middleware provides basic routing protection only

  // Check for JWT token in Authorization header (for API routes)
  const authHeader = request.headers.get('authorization');
  const hasAuthHeader = authHeader?.startsWith('Bearer ');

  // Debugging logs (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${pathname} - Auth Header: ${hasAuthHeader ? 'YES' : 'NO'}`);
  }

  // 1. Login page: Always allow access (token will be obtained after login)
  if (pathname === '/login') {
    // Component-level logic will handle redirect if already logged in
    return NextResponse.next();
  }

  // 2. Admin routes: Allow through, component-level auth will handle actual validation
  // Middleware in Next.js App Router has limited access to client-side storage
  if (pathname.startsWith('/admin')) {
    // Allow through - components will check localStorage and redirect if needed
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Middleware 적용 경로 설정
export const config = {
  matcher: ['/admin/:path*', '/login'],
};
