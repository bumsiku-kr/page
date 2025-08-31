'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">로딩중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">관리자 페이지</h1>
      <p className="text-gray-600">관리자 전용 페이지입니다.</p>
    </div>
  );
}
