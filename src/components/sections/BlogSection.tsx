'use client';

import React from 'react';
import { PostSummary, Category } from '../../types';
import PostList from '../blog/PostList';
import CategorySidebar from '../blog/CategorySidebar';
import ErrorMessage from '../ui/feedback/ErrorMessage';

interface BlogSectionProps {
  posts?: {
    content: PostSummary[];
    totalElements: number;
    pageNumber: number;
    pageSize: number;
  };
  categories?: Category[];
  selectedCategory?: number;
  className?: string;
}

export default function BlogSection({
  posts,
  categories,
  selectedCategory,
  className = '',
}: BlogSectionProps) {
  // 데이터가 없는 경우 오류 메시지 표시
  if (!posts || !categories) {
    return (
      <section className={`py-8 ${className}`}>
        <ErrorMessage message="블로그 게시물을 불러오는 중 오류가 발생했습니다." />
      </section>
    );
  }

  // 페이지네이션 계산
  const totalPages = Math.ceil(posts.totalElements / posts.pageSize);
  const currentPage = posts.pageNumber + 1;

  return (
    <section className={`py-8 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 게시글 목록 */}
        <main className="lg:w-3/4">
          <PostList
            posts={posts.content}
            currentPage={currentPage}
            totalPages={totalPages}
            categories={categories}
          />
        </main>

        {/* 사이드바 (카테고리) */}
        <aside className="lg:w-1/4">
          <CategorySidebar
            selectedCategory={selectedCategory}
            categories={categories}
          />
        </aside>
      </div>
    </section>
  );
} 