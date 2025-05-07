'use client';

import Link from 'next/link';
import { PostSummary, Category } from '../types';

interface PostListProps {
  posts: PostSummary[];
  currentPage: number;
  totalPages: number;
  categories: Category[];
}

export default function PostList({ posts, currentPage, totalPages, categories }: PostListProps) {
  // 카테고리 ID로 카테고리 이름을 찾는 함수
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '미분류';
  };

  return (
    <div className="max-w-3xl">
      {posts.length > 0 ? (
        <>
          {posts.map((post) => (
            <article
              key={post.id}
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
                  {getCategoryName(post.category)}
                </span>
              </div>
              
              <Link href={`/posts/${post.id}`}>
                <h2 className="text-2xl font-bold mb-3 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
              </Link>
              
              <p className="text-gray-600 mb-4">
                {post.summary}
              </p>
              
              <Link
                href={`/posts/${post.id}`}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                더 읽기
              </Link>
            </article>
          ))}
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow">
                {/* 이전 페이지 */}
                <Link
                  href={`/blog?page=${currentPage}`}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  이전
                </Link>

                {/* 페이지 번호 */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    href={`/blog?page=${page}`}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </Link>
                ))}

                {/* 다음 페이지 */}
                <Link
                  href={`/blog?page=${currentPage + 2}`}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  다음
                </Link>
              </nav>
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