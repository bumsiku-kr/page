'use client';

import { useEffect } from 'react';

export default function PortfolioPage() {
  useEffect(() => {
    // 노션 페이지로 리다이렉트
    window.open('https://bam-siku.notion.site/Bumshik-Park-25e9bea4526b80709b86c27ac52437dc?source=copy_link', '_blank');
    // 홈페이지로 돌아가기
    window.location.href = '/';
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Resume로 이동 중...</h1>
      <p className="text-gray-600 text-center">
        Resume 페이지로 이동하고 있습니다.
        <br />
        자동으로 이동되지 않으면{' '}
        <a 
          href="https://bam-siku.notion.site/Bumshik-Park-25e9bea4526b80709b86c27ac52437dc?source=copy_link"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          여기를 클릭하세요
        </a>
      </p>
    </div>
  );
}
