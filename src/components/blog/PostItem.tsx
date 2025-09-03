'use client';

import React from 'react';
import Link from 'next/link';
import { PostSummary, Category } from '../../types';
import { getCategoryName } from '../../lib/utils/category';
import Card from '../ui/Card';

interface PostItemProps {
  post: PostSummary;
  categories: Category[];
}

export default function PostItem({ post, categories }: PostItemProps) {
  return (
    <Card className="mb-8 last:mb-0" hasShadow={false} hasBorder={false} isPadded={false}>
      <article className="pb-8 border-b border-gray-200 last:border-0">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
            {getCategoryName(post.categoryId, categories)}
          </span>
        </div>

        <Link href={`/posts/${post.id}`}>
          <h2 className="text-2xl font-bold mb-3 hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 mb-4">{post.summary}</p>

        <div className="flex justify-between items-center">
          <Link
            href={`/posts/${post.id}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            더 읽기
          </Link>
          <span className="text-sm text-gray-500">{post.views?.toLocaleString() || 0} 읽음</span>
        </div>
      </article>
    </Card>
  );
}
