'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageParamName?: string;  // 페이지 파라미터 이름 (기본값: page)
  baseUrl?: string;        // 기본 URL (지정된 경우 pathname 대신 사용)
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  pageParamName = 'page',
  baseUrl
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 현재 URL 쿼리 파라미터를 유지하면서 페이지만 변경하는 함수
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(pageParamName, pageNumber.toString());
    return `${baseUrl || pathname}?${params.toString()}`;
  };

  // 페이지 번호 범위 계산 (최대 5개 표시)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // 시작 페이지 조정
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <nav className="flex justify-center mt-8" aria-label="페이지 네비게이션">
      <ul className="flex gap-1">
        {/* 이전 페이지 버튼 */}
        {currentPage > 1 && (
          <li>
            <Link
              href={createPageURL(currentPage - 1)}
              className="inline-flex items-center justify-center w-10 h-10 rounded border border-gray-300 hover:bg-gray-100"
              aria-label="이전 페이지"
            >
              &lsaquo;
            </Link>
          </li>
        )}

        {/* 페이지 번호 */}
        {getPageNumbers().map(pageNumber => (
          <li key={pageNumber}>
            <Link
              href={createPageURL(pageNumber)}
              className={`inline-flex items-center justify-center w-10 h-10 rounded ${
                currentPage === pageNumber
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-100'
              }`}
              aria-current={currentPage === pageNumber ? 'page' : undefined}
            >
              {pageNumber}
            </Link>
          </li>
        ))}

        {/* 다음 페이지 버튼 */}
        {currentPage < totalPages && (
          <li>
            <Link
              href={createPageURL(currentPage + 1)}
              className="inline-flex items-center justify-center w-10 h-10 rounded border border-gray-300 hover:bg-gray-100"
              aria-label="다음 페이지"
            >
              &rsaquo;
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
