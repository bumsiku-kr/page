// src/app/posts/[postId]/page.tsx

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { api } from '../../../lib/api/index';
import Container from '../../../components/ui/Container';
import Loading from '../../../components/ui/feedback/Loading';
import ErrorMessage from '../../../components/ui/feedback/ErrorMessage';
import Comments from '../../../components/blog/Comments';
import { getCategoryName } from '../../../lib/utils/category';
import Divider from '../../../components/ui/Divider';
import MarkdownRenderer from '../../../components/ui/data-display/MarkdownRenderer';
import { Metadata } from 'next';
import Link from 'next/link';
import ShareButton from '../../../components/blog/ShareButton';
import { getPostMetadata } from '../../../lib/metadata';
import ViewCounter from '../../../components/blog/ViewCounter';

interface PostDetailPageProps {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const post = await api.posts.getOne(parseInt(postId, 10));

  if (!post) {
    return {
      title: '게시물을 찾을 수 없음 | Siku 기술블로그',
      description: '요청하신 게시물을 찾을 수 없습니다.',
    };
  }

  const description = post.summary || post.content.slice(0, 150).replace(/[#*`]/g, '');

  return getPostMetadata(post.title, description, post.id, post.createdAt, post.updatedAt);
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  // await the incoming params object
  const { postId } = await params;

  try {
    // fetch post + categories in parallel
    const [post, categories] = await Promise.all([
      api.posts.getOne(parseInt(postId, 10)),
      api.categories.getList(),
    ]);

    if (!post || !post.id) {
      notFound();
    }

    // format createdAt date
    const formattedDate = new Date(post.createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <Container size="md" className="py-4">
        <ViewCounter postId={postId} />
        <article itemScope itemType="https://schema.org/BlogPosting">
          <header className="mb-8">
            <nav aria-label="breadcrumb" className="mb-4 text-sm text-gray-500">
              <ol className="flex">
                <li className="mr-2">
                  <Link href="/">홈</Link>
                </li>
                <li className="mx-2">
                  <span>&gt;</span>
                </li>
                <li>
                  <span>{post.title}</span>
                </li>
              </ol>
            </nav>
            <div className="mb-2">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                {getCategoryName(post.categoryId, categories)}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-2" itemProp="headline">
              {post.title}
            </h1>
            <div className="flex items-center text-sm text-gray-500">
              <span
                className="mr-2"
                itemProp="author"
                itemScope
                itemType="https://schema.org/Person"
              >
                <span itemProp="name">Siku</span>
              </span>
              <time itemProp="datePublished" dateTime={post.createdAt}>
                {formattedDate}
              </time>
              <div className="ml-auto">
                <ShareButton className="hover:bg-gray-100" />
              </div>
            </div>
          </header>

          <Divider variant="border" />

          <div itemProp="articleBody">
            <Suspense fallback={<Loading />}>
              <MarkdownRenderer content={post.content} />
            </Suspense>
          </div>
        </article>

        <Divider variant="border" />

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 mx-2">댓글</h2>
        </div>

        <section>
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

// for SSG: generate all valid [postId] params at build time
export async function generateStaticParams() {
  try {
    const postsData = await api.posts.getList();
    if (!postsData?.content || !Array.isArray(postsData.content)) {
      return [];
    }

    return postsData.content.map(post => ({
      postId: post.id.toString(),
    }));
  } catch (error) {
    console.error('정적 경로 생성 중 오류:', error);
    return [];
  }
}

export const revalidate = 60;
