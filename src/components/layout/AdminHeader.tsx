'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminHeader() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  const handleLogout = () => {
    // JSESSIONID 쿠키 제거
    document.cookie = 'JSESSIONID=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    // 로그인 페이지로 리다이렉트
    router.push('/login');
  };

  return (
    <header className="bg-indigo-600 text-white fixed w-full top-0 left-0 z-10">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center">
          <Link href="/admin" className="text-xl font-bold">
            블로그 관리자
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {isLoggedIn && <span className="text-sm">{user?.username || '관리자'}</span>}
          <Link href="/" className="hover:underline" target="_blank">
            사이트 방문
          </Link>
          <button onClick={handleLogout} className="hover:underline">
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
