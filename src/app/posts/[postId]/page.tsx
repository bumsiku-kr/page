import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api/index';
import Container from '../../../components/ui/Container';
import Loading from '../../../components/ui/feedback/Loading';
import ErrorMessage from '../../../components/ui/feedback/ErrorMessage';
import Comments from '../../../components/blog/Comments';
import { getCategoryName } from '../../../lib/utils/category';
import Divider from '../../../components/ui/Divider';

// 마크다운 콘텐츠를 HTML로 렌더링하기 위한 컴포넌트
import MarkdownRenderer from '../../../components/ui/data-display/MarkdownRenderer';
import { Post, Category } from '../../../types';

interface PostDetailPageProps {
  params: {
    postId: string;
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const postId = params.postId;
  
  // 서버에서 직접 데이터 가져오기
  try {
    // API에서 게시물 상세 정보와 카테고리 목록 가져오기
    const [post, categories] = await Promise.all([
      api.posts.getOne(parseInt(postId, 10)),
      api.categories.getList(),
    ]);

    // API 응답에 대한 안전성 검사
    if (!post || !post.id) {
      notFound();
    }

    // 게시물 날짜 포매팅
    const formattedDate = new Date(post.createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <Container size="md" className="py-4">
        <div className="mb-8">
          
          <div className="mb-2">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
              {getCategoryName(post.categoryId, categories)}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">Siku</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <Divider variant="border" />

        <div>
          <Suspense fallback={<Loading />}>
            <MarkdownRenderer content={post.content} />
          </Suspense>
        </div>

        <Divider variant="border" />

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 mx-2">댓글</h2>
        </div>

        <section className="">
          <Suspense fallback={<Loading />}>
            <Comments postId={postId} />
          </Suspense>
        </section>
      </Container>
    );
  } catch (err) {
    console.error('데이터 로딩 중 오류 발생:', err);
    return <ErrorMessage message="데이터를 불러오는 중 오류가 발생했습니다." />;
  }
}

// 정적 파라미터 생성을 위한 함수 (선택적)
export async function generateStaticParams() {
  try {
    const postsData = await api.posts.getList();
    if (!postsData || !postsData.content || !Array.isArray(postsData.content)) {
      return [];
    }
    
    return postsData.content.map((post) => ({
      postId: post.id.toString(),
    }));
  } catch (error) {
    console.error('정적 경로 생성 중 오류:', error);
    return [];
  }
}
