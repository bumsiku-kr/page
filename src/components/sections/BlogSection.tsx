'use client';

import React, { memo, useMemo } from 'react';
import { PostSummary, Tag, SortOption } from '../../types';
import PostList from '../blog/PostList';
import TagSidebar from '../blog/TagSidebar';
import ErrorMessage from '../ui/feedback/ErrorMessage';
import SortButton from '../blog/SortButton';

interface BlogSectionProps {
  posts?: {
    content: PostSummary[];
    totalElements: number;
    pageNumber: number;
    pageSize: number;
  };
  tags?: Tag[];
  selectedTag?: string;
  className?: string;
  onPageChange?: (page: number) => void;
  currentSort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

/**
 * Optimized BlogSection with React.memo and useMemo
 *
 * Memoizes expensive calculations and prevents unnecessary re-renders
 */
const BlogSection = memo(function BlogSection({
  posts,
  tags,
  selectedTag,
  className = '',
  onPageChange,
  currentSort,
  onSortChange,
}: BlogSectionProps) {
  // Memoize pagination calculations (must be called before any early returns)
  const { totalPages, currentPage } = useMemo(
    () => {
      if (!posts) return { totalPages: 0, currentPage: 0 };
      return {
        totalPages: Math.ceil(posts.totalElements / posts.pageSize),
        currentPage: posts.pageNumber + 1,
      };
    },
    [posts]
  );

  // 데이터가 없는 경우 오류 메시지 표시
  if (!posts || !tags) {
    return (
      <section className={`py-2 ${className}`}>
        <ErrorMessage message="블로그 게시물을 불러오는 중 오류가 발생했습니다." />
      </section>
    );
  }

  return (
    <section className={`py-2 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 게시글 목록 */}
        <main className="lg:w-3/4">
          <div className="flex justify-end items-center mb-4">
            {currentSort && onSortChange && (
              <SortButton currentSort={currentSort} onSortChange={onSortChange} />
            )}
          </div>
          <PostList
            posts={posts.content}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </main>

        {/* 사이드바 (태그) */}
        <aside className="lg:w-1/4 lg:mt-2">
          <TagSidebar selectedTag={selectedTag} tags={tags} totalPostCount={posts.totalElements} />
        </aside>
      </div>
    </section>
  );
});

export default BlogSection;
