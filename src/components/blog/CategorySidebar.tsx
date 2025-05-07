'use client';

import Link from 'next/link';
import { Category } from '../../types';

interface CategorySidebarProps {
  selectedCategory?: number;
  categories?: Category[];
}

export default function CategorySidebar({
  selectedCategory,
  categories = [],
}: CategorySidebarProps) {
  // URL 생성 함수
  const getCategoryUrl = (categoryId?: number) => {
    if (!categoryId) {
      return '/';
    }
    return `/?category=${categoryId}`;
  };

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">카테고리</h2>
      <ul className="space-y-2">
        <li>
          <Link
            href="/"
            className={`block w-full text-left py-1 px-2 rounded-md transition-colors ${
              !selectedCategory ? 'font-semibold bg-gray-100' : ''
            }`}
          >
            전체
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
              {selectedCategory === category.id && <span className="ml-2">×</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
