'use client';

import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  className = '',
}: PaginationProps) {
  // 페이지가 한 페이지뿐이면 페이지네이션을 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }

  // URL 구성 헬퍼 함수
  const getPageUrl = (page: number) => {
    // 기본 URL에 물음표가 있는지 확인하여 적절한 연결자 추가
    const connector = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${connector}page=${page}`;
  };

  // 보여줄 페이지 버튼 계산 (최대 5개)
  const generatePageNumbers = () => {
    const pageNumbers = [];
    
    if (totalPages <= 5) {
      // 총 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 중앙에 현재 페이지 표시, 양쪽에 2개씩 (최대 5개)
      // 시작 페이지 계산
      let startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(startPage + 4, totalPages);
      
      // 끝 페이지가 총 페이지보다 작으면 시작 페이지 조정
      if (endPage < totalPages) {
        startPage = Math.max(1, endPage - 4);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <nav className={`flex justify-center mt-8 ${className}`}>
      <ul className="inline-flex rounded-md shadow">
        {/* 이전 페이지 버튼 */}
        <li>
          <Link
            href={getPageUrl(currentPage - 1)}
            className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            aria-disabled={currentPage === 1}
            tabIndex={currentPage === 1 ? -1 : 0}
            onClick={(e) => {
              if (currentPage === 1) {
                e.preventDefault();
              }
            }}
          >
            이전
          </Link>
        </li>

        {/* 페이지 번호 버튼들 */}
        {pageNumbers.map((page) => (
          <li key={page}>
            <Link
              href={getPageUrl(page)}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                page === currentPage
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          </li>
        ))}

        {/* 다음 페이지 버튼 */}
        <li>
          <Link
            href={getPageUrl(currentPage + 1)}
            className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            aria-disabled={currentPage === totalPages}
            tabIndex={currentPage === totalPages ? -1 : 0}
            onClick={(e) => {
              if (currentPage === totalPages) {
                e.preventDefault();
              }
            }}
          >
            다음
          </Link>
        </li>
      </ul>
    </nav>
  );
} 