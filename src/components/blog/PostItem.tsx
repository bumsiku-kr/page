'use client';

import React from 'react';
import Link from 'next/link';
import { PostSummary } from '../../types';
import Card from '../ui/Card';
import { dateUtils } from '@/lib/utils/date';

interface PostItemProps {
  post: PostSummary;
}

export default function PostItem({ post }: PostItemProps) {
  return (
    <Card className="mb-8 last:mb-0" hasShadow={false} hasBorder={false} isPadded={false}>
      <article className="pb-8 border-b border-gray-200 last:border-0">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm text-gray-500">{dateUtils.formatKorean(post.createdAt)}</p>
          <div className="flex flex-wrap gap-1">
            {(post.tags || [])
              .slice()
              .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) // 안전한 문자열 정렬
              .map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700"
                >
                  #{tag}
                </span>
              ))}
          </div>
        </div>

        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-2xl font-bold mb-3 hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 mb-4">{post.summary}</p>

        <div className="flex justify-between items-center">
          <Link
            href={`/posts/${post.slug}`}
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
