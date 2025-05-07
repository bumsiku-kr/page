'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import Container from '../../../components/ui/Container';
import Loading from '../../../components/ui/feedback/Loading';
import ErrorMessage from '../../../components/ui/feedback/ErrorMessage';
import Comments from '../../../components/blog/Comments';
import { getCategoryName } from '../../../lib/utils/category';
import Divider from '../../../components/ui/Divider';

// 마크다운 콘텐츠를 HTML로 렌더링하기 위한 컴포넌트
import MarkdownRenderer from '../../../components/ui/data-display/MarkdownRenderer';
import { Post, Category } from '../../../types';

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // API에서 게시물 상세 정보와 카테고리 목록 가져오기
        const [postData, categoriesData] = await Promise.all([
          api.posts.getOne(parseInt(postId, 10)),
          api.categories.getList(),
        ]);

        // API 응답에 대한 안전성 검사
        if (!postData || !postData.id) {
          router.push('/404');
          return;
        }

        setPost(postData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('데이터 로딩 중 오류 발생:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');

        // 404 에러인 경우 notFound 페이지로 리다이렉트
        if (
          (err as Error).message.includes('404') ||
          (err as Error).message.includes('찾을 수 없음')
        ) {
          router.push('/404');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [postId, router]);

  // 로딩 중 표시
  if (isLoading) {
    return <Loading />;
  }

  // 오류 표시
  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!post) {
    return null;
  }

  // 게시물 날짜 포매팅
  const formattedDate = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Container size="md" className="py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            게시글 목록
          </Link>
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>

        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="flex gap-2 mb-6">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
            {getCategoryName(post.categoryId, categories)}
          </span>
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        <Suspense fallback={<Loading />}>
          <MarkdownRenderer content={post.content} />
        </Suspense>
      </div>

      <Divider variant="border" />

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">댓글</h2>
        <Suspense fallback={<Loading />}>
          <Comments postId={postId} />
        </Suspense>
      </section>
    </Container>
  );
}
