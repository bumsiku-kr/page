'use client';

import React from 'react';
import { PostSummary } from '../../types';
import PostItem from './PostItem';
import Pagination from '../ui/Pagination';

interface PostListProps {
  posts: PostSummary[];
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  onPageChange?: (page: number) => void;
  footerRight?: React.ReactNode;
}

export default function PostList({
  posts,
  currentPage,
  totalPages,
  baseUrl = '/',
  onPageChange,
  footerRight,
}: PostListProps) {
  return (
    <div className="max-w-3xl">
      {posts.length > 0 ? (
        <>
          {posts.map(post => (
            <PostItem key={post.id} post={post} />
          ))}

          {footerRight ? (
            <div className="mt-6 grid grid-cols-3 items-center">
              <div />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={baseUrl}
                onPageChange={onPageChange}
                className="mt-0 justify-self-center"
              />
              <div className="justify-self-end flex items-center gap-3">{footerRight}</div>
            </div>
          ) : (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={baseUrl}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500">게시글이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
