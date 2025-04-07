'use client';

import { useState } from 'react';
import Link from 'next/link';

// 임시 블로그 데이터
const blogPosts = [
  {
    id: 1,
    title: 'React에서 상태 관리하기',
    excerpt: 'React 애플리케이션에서 상태 관리를 위한 다양한 접근 방식과 라이브러리들을 비교해봅니다.',
    date: '2023-04-01',
    tags: ['React', '상태관리', 'Redux', 'Context API'],
    category: '프론트엔드',
  },
  {
    id: 2,
    title: 'Next.js 13의 새로운 기능',
    excerpt: 'Next.js 13에서 소개된 앱 라우터, 서버 컴포넌트 및 데이터 페칭에 대해 알아봅니다.',
    date: '2023-03-15',
    tags: ['Next.js', 'React', '서버 컴포넌트'],
    category: '프론트엔드',
  },
  {
    id: 3,
    title: 'TypeScript 타입 시스템 깊게 이해하기',
    excerpt: 'TypeScript의 고급 타입 기능을 통해 더 강력한 타입 안전성을 갖춘 코드를 작성하는 방법을 알아봅니다.',
    date: '2023-02-28',
    tags: ['TypeScript', '타입 시스템'],
    category: '개발 언어',
  },
  {
    id: 4,
    title: 'CSS Grid와 Flexbox 완벽 가이드',
    excerpt: '모던 CSS 레이아웃 기술인 Grid와 Flexbox의 차이점과 적절한 사용법에 대해 알아봅니다.',
    date: '2023-02-10',
    tags: ['CSS', 'Grid', 'Flexbox'],
    category: 'CSS',
  },
];

// 임시 카테고리 데이터
const categories = [
  { name: '프론트엔드', count: 2 },
  { name: '개발 언어', count: 1 },
  { name: 'CSS', count: 1 },
  { name: '백엔드', count: 0 },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 카테고리에 따라 게시글 필터링
  const filteredPosts = selectedCategory
    ? blogPosts.filter(post => post.category === selectedCategory)
    : blogPosts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">블로그</h1>
        <p className="text-gray-600">
          프론트엔드 개발, React, TypeScript 그리고 UI/UX에 관련된 글을 공유합니다.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 사이드바 (카테고리) */}
        <aside className="lg:w-1/4">
          <div className="sticky top-24 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">카테고리</h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                    selectedCategory === null ? 'font-semibold bg-gray-100' : ''
                  }`}
                >
                  전체 ({blogPosts.length})
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.name}>
                  <button
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                      selectedCategory === category.name ? 'font-semibold bg-gray-100' : ''
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* 게시글 목록 */}
        <main className="lg:w-3/4">
          <div className="max-w-3xl">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="mb-8 pb-8 border-b border-gray-200 last:border-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-500">{post.date}</p>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                    {post.category}
                  </span>
                </div>
                <Link href={`/posts/${post.id}`}>
                  <h2 className="text-2xl font-bold mb-3 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}

            {/* 게시글이 없을 경우 */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">선택한 카테고리에 게시글이 없습니다.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 