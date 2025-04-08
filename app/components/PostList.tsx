'use client';

import Link from 'next/link';
import { Post } from '../types';
import Pagination from './Pagination';

interface PostListProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
}

export default function PostList({ posts, currentPage, totalPages }: PostListProps) {
  return (
    <div className="max-w-3xl">
      {posts.length > 0 ? (
        <>
          {posts.map((post) => (
            <article
              key={post.postId}
              className="mb-8 pb-8 border-b border-gray-200 last:border-0"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                  {post.category}
                </span>
              </div>
              
              <Link href={`/posts/${post.postId}`}>
                <h2 className="text-2xl font-bold mb-3 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
              </Link>
              
              <p className="text-gray-600 mb-4 leading-relaxed">{post.summary}</p>
            </article>
          ))}
          
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} />
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