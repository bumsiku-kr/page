import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 여러 가능한 세션 쿠키 확인
  const jsessionidCookie = request.cookies.get('JSESSIONID')?.value;
  const sessionCookie = request.cookies.get('SESSION')?.value;
  const springSessionId = request.cookies.get('SPRING_SESSION')?.value;
  const basicCookies = request.cookies.get('SPRING.SESSION')?.value;
  const isLoggedInCookie = request.cookies.get('isLoggedIn')?.value;

  // 세션이 있는지 확인
  const hasSession =
    jsessionidCookie || sessionCookie || springSessionId || basicCookies || isLoggedInCookie;

  // 디버깅 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${pathname} - Session: ${hasSession ? 'YES' : 'NO'}`);
  }

  // 1. 로그인 페이지: 세션이 있으면 /admin으로 리다이렉트
  if (pathname === '/login') {
    if (hasSession) {
      console.log('[Middleware] Already logged in, redirecting to /admin');
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // 세션 없으면 로그인 페이지 접근 허용
    return NextResponse.next();
  }

  // 2. 관리자 경로: 세션이 없으면 /login으로 리다이렉트
  if (pathname.startsWith('/admin')) {
    if (!hasSession) {
      console.log('[Middleware] No session, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // 세션 있으면 관리자 페이지 접근 허용
    return NextResponse.next();
  }

  return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: ['/admin/:path*', '/login'],
};
