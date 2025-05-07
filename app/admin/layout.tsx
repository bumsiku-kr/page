'use client';

import React from 'react';
import { useAuth, AuthProvider } from '../contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 보호된 컴포넌트
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading, logout } = useAuth();
  const pathname = usePathname();

  // 활성 메뉴 아이템 확인
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 로그인 페이지가 아니고 로그인되지 않은 경우에만 리디렉션
  if (!isLoggedIn && pathname !== '/admin') {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col">
        <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h1>
        <p className="mb-4">이 페이지에 접근하기 위해서는 관리자 로그인이 필요합니다.</p>
        <Link 
          href="/admin" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          로그인 페이지로 이동
        </Link>
      </div>
    );
  }

  // 로그인되지 않았고 현재 로그인 페이지인 경우는 그대로 표시
  if (!isLoggedIn && pathname === '/admin') {
    return <>{children}</>;
  }

  // 로그인 된 경우 관리자 레이아웃 표시
  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <div className="w-64 bg-gray-800 text-white shadow-lg">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">관리자 대시보드</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin/posts" 
                className={`block py-2 px-3 rounded ${isActive('/admin/posts') ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
              >
                게시물 관리
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/categories" 
                className={`block py-2 px-3 rounded ${isActive('/admin/categories') ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
              >
                카테고리 관리
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-auto p-4 border-t border-gray-700 absolute bottom-0 w-64">
          <button 
            onClick={logout}
            className="w-full py-2 px-3 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white shadow">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              {pathname.includes('/posts/new') && '새 게시물 작성'}
              {pathname.includes('/posts/') && pathname.includes('/edit') && '게시물 수정'}
              {pathname === '/admin/posts' && '게시물 목록'}
              {pathname === '/admin/categories' && '카테고리 관리'}
            </h1>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// AuthProvider로 래핑된 레이아웃 컴포넌트
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthProvider>
  );
} 