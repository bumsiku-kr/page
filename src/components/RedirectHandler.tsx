'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface RedirectHandlerProps {
  redirectPath: string;
}

const RedirectHandler = ({ redirectPath }: RedirectHandlerProps) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 현재 경로와 리다이렉트할 경로가 다른 경우에만 리다이렉트
    if (pathname !== redirectPath) {
      console.log('리다이렉트 수행:', { from: pathname, to: redirectPath });
      router.replace(redirectPath);
    } else {
      console.log('리다이렉트 스킵: 현재 경로와 동일함', pathname);
    }
  }, [redirectPath, router, pathname]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">페이지를 이동하고 있습니다...</p>
      </div>
    </div>
  );
};

export default RedirectHandler;
