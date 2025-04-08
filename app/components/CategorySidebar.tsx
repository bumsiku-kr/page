'use client';

import Link from 'next/link';
import { Category } from '../types';

interface CategorySidebarProps {
  selectedCategory?: string;
  categories?: Category[];
}

export default function CategorySidebar({ selectedCategory, categories = [] }: CategorySidebarProps) {
  return (
    <div className="sticky top-24 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">카테고리</h2>
      <ul className="space-y-2">
        <li>
          <Link 
            href="/blog"
            className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
              !selectedCategory ? 'font-semibold bg-gray-100' : ''
            }`}
          >
            전체
          </Link>
        </li>
        
        {categories.map((category) => (
          <li key={category.category}>
            <Link 
              href={`/blog?category=${encodeURIComponent(category.category)}`}
              className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                selectedCategory === category.category ? 'font-semibold bg-gray-100' : ''
              }`}
            >
              {category.category}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 