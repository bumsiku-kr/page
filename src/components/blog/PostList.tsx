'use client';

import React from 'react';
import { PostSummary, Category } from '../../types';
import PostItem from './PostItem';
import Pagination from '../ui/Pagination';

interface PostListProps {
  posts: PostSummary[];
  currentPage: number;
  totalPages: number;
  categories: Category[];
  baseUrl?: string;
}

export default function PostList({
  posts,
  currentPage,
  totalPages,
  categories,
  baseUrl = '/',
}: PostListProps) {
  return (
    <div className="max-w-3xl">
      {posts.length > 0 ? (
        <>
          {posts.map(post => (
            <PostItem key={post.id} post={post} categories={categories} />
          ))}

          <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={baseUrl} />
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500">게시글이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
