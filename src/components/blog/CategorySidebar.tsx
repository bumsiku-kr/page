'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Category } from '../../types';

interface CategorySidebarProps {
  selectedCategory?: number;
  categories?: Category[];
  totalPostCount?: number;
}

export default function CategorySidebar({
  selectedCategory,
  categories = [],
  totalPostCount = 0,
}: CategorySidebarProps) {
  const searchParams = useSearchParams();

  // URL 생성 함수 - 현재 정렬 상태 유지
  const getCategoryUrl = (categoryId?: number) => {
    const params = new URLSearchParams(searchParams);

    if (!categoryId) {
      params.delete('category');
    } else {
      params.set('category', categoryId.toString());
    }

    // 페이지는 1로 리셋
    params.set('page', '1');

    const queryString = params.toString();
    return queryString ? `/?${queryString}` : '/';
  };

  // 실제 전체 글 개수 계산 (모든 카테고리의 postCount 합산)
  const actualTotalCount = categories.reduce((total, category) => total + category.postCount, 0);

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">카테고리</h2>
      <ul className="space-y-2">
        <li>
          <Link
            href="/"
            className={`flex items-center w-full text-left py-1 px-2 rounded-md transition-colors ${
              !selectedCategory ? 'font-semibold bg-gray-100' : ''
            }`}
          >
            전체
            <span className="text-sm ml-1">({actualTotalCount})</span>
          </Link>
        </li>

        {categories.map(category => (
          <li key={category.id}>
            <Link
              href={getCategoryUrl(category.id)}
              className={`flex items-center w-full text-left py-1 px-2 rounded-md transition-colors ${
                selectedCategory === category.id ? 'font-semibold bg-gray-100' : ''
              }`}
            >
              {category.name}
              <span className="text-sm ml-1">({category.postCount})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
