import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 여러 가능한 세션 쿠키 확인
  const jsessionidCookie = request.cookies.get('JSESSIONID')?.value;
  const sessionCookie = request.cookies.get('SESSION')?.value;
  const springSessionId = request.cookies.get('SPRING_SESSION')?.value;
  const basicCookies = request.cookies.get('SPRING.SESSION')?.value;

  // isLoggedIn 별도 상태 쿠키 확인
  const isLoggedInCookie = request.cookies.get('isLoggedIn')?.value;

  const { pathname } = request.nextUrl;

  // POST /login 요청일 경우 요청과 응답 정보 출력
  if (pathname === '/login' && request.method === 'POST') {
    console.log('\n=== 로그인 요청 정보 ===');
    console.log('요청 URL:', request.url);
    console.log('요청 메서드:', request.method);
    console.log('요청 헤더:', Object.fromEntries(request.headers));

    // 응답을 가로채서 정보 출력
    const response = NextResponse.next();
    console.log('\n=== 로그인 응답 정보 ===');
    console.log('응답 상태:', response.status);
    console.log('응답 헤더:', Object.fromEntries(response.headers));
    console.log('쿠키 정보:', response.cookies.getAll());
    console.log('=== 로그인 정보 끝 ===\n');
    return response;
  }

  // 모든 쿠키 출력
  console.log(
    '모든 쿠키:',
    [...request.cookies.getAll()].map(c => `${c.name}=${c.value}`).join('; ')
  );
  console.log('미들웨어 경로:', pathname);
  console.log('세션 상태:', {
    JSESSIONID: !!jsessionidCookie,
    SESSION: !!sessionCookie,
    SPRING_SESSION: !!springSessionId,
    'SPRING.SESSION': !!basicCookies,
    isLoggedIn: !!isLoggedInCookie,
  });

  // 세션이 있는지 다양한 방식으로 확인
  const hasSession =
    jsessionidCookie || sessionCookie || springSessionId || basicCookies || isLoggedInCookie;

  // 관리자 경로 보호
  if (pathname.startsWith('/admin') && !hasSession) {
    console.log('세션 없음: 로그인 페이지로 리다이렉트');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 이미 로그인된 상태에서 로그인 페이지 접근 시 관리자 페이지로 리다이렉트
  if (pathname.startsWith('/login') && hasSession) {
    console.log('이미 로그인됨: 관리자 페이지로 리다이렉트');
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: ['/admin/:path*', '/login'],
};
