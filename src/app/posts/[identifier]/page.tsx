// src/app/posts/[identifier]/page.tsx

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { api } from '../../../lib/api/index';
import Container from '../../../components/ui/Container';
import Loading from '../../../components/ui/feedback/Loading';
import ErrorMessage from '../../../components/ui/feedback/ErrorMessage';
import { Comments } from '@/features/comments/components';
import Divider from '../../../components/ui/Divider';
import MarkdownRenderer from '../../../components/ui/data-display/MarkdownRenderer';
import { Metadata } from 'next';
import Link from 'next/link';
import ShareButton from '../../../components/blog/ShareButton';
import { getPostMetadata, getPostMetadataById } from '../../../lib/metadata';
import ViewCounter from '../../../components/blog/ViewCounter';
import RedirectHandler from '../../../components/RedirectHandler';

interface PostDetailPageProps {
  params: Promise<{ identifier: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string }>;
}): Promise<Metadata> {
  const { identifier } = await params;

  try {
    let post;

    // identifier가 숫자인지 확인 (ID인 경우)
    if (/^\d+$/.test(identifier)) {
      post = await api.posts.getOne(parseInt(identifier, 10));
    } else {
      // slug인 경우
      post = await api.posts.getBySlug(identifier);
    }

    if (!post) {
      return {
        title: '게시물을 찾을 수 없음 | Siku 기술블로그',
        description: '요청하신 게시물을 찾을 수 없습니다.',
      };
    }

    const description = post.summary || post.content.slice(0, 150).replace(/[#*`]/g, '');

    // slug 기반 메타데이터 우선 사용
    if (post.canonicalPath) {
      return getPostMetadata(
        post.title,
        description,
        post.slug,
        post.canonicalPath,
        post.createdAt,
        post.updatedAt
      );
    }

    // 폴백으로 ID 기반 메타데이터 사용
    return getPostMetadataById(post.title, description, post.id, post.createdAt, post.updatedAt);
  } catch (error) {
    console.error('메타데이터 생성 오류:', error);
    return {
      title: '게시물을 찾을 수 없음 | Siku 기술블로그',
      description: '요청하신 게시물을 찾을 수 없습니다.',
    };
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { identifier } = await params;

  try {
    let post;

    // identifier가 숫자인지 확인 (ID인 경우)
    if (/^\d+$/.test(identifier)) {
      post = await api.posts.getOne(parseInt(identifier, 10));

      // 디버깅을 위한 로그 추가
      console.log('ID로 조회한 게시물:', {
        id: post?.id,
        slug: post?.slug,
        canonicalPath: post?.canonicalPath,
        hasCanonicalPath: !!post?.canonicalPath,
      });

      // ID로 접근했지만 slug URL로 리다이렉트해야 함
      // canonicalPath가 있으면 우선 사용, 없으면 slug로 경로 생성
      const redirectPath = post.canonicalPath || `/posts/${post.slug}`;
      const currentPath = `/posts/${identifier}`;

      // 현재 경로와 리다이렉트할 경로가 다른 경우에만 리다이렉트
      if (currentPath !== redirectPath) {
        console.log('ID -> slug 리다이렉트:', { currentPath, redirectPath });
        return <RedirectHandler redirectPath={redirectPath} />;
      } else {
        console.log('리다이렉트 불필요: 경로가 동일함');
      }
    } else {
      // slug인 경우
      post = await api.posts.getBySlug(identifier);
    }

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
        <ViewCounter postId={post.id.toString()} />
        <article itemScope itemType="https://schema.org/BlogPosting">
          <header className="mb-8">
            {post.tags && post.tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {post.tags
                  .slice()
                  .sort((a, b) => a.localeCompare(b))
                  .map(tag => (
                    <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`}>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                        #{tag}
                      </span>
                    </Link>
                  ))}
              </div>
            )}

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
                <ShareButton className="hover:bg-gray-100" canonicalUrl={post.canonicalPath} />
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
            <Comments postId={post.id.toString()} />
          </Suspense>
        </section>
      </Container>
    );
  } catch (err: any) {
    console.error('데이터 로딩 중 오류 발생:', err);

    // 400 계열 오류는 슬러그 검증 실패로 간주
    if (err?.message || (err?.response?.status >= 400 && err?.response?.status < 500)) {
      return (
        <Container size="md" className="py-8">
          <ErrorMessage message={err?.message || '잘못된 게시글 주소입니다.'} />
          <div className="mt-4 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
              홈으로 돌아가기
            </Link>
          </div>
        </Container>
      );
    }

    return <ErrorMessage message="데이터를 불러오는 중 오류가 발생했습니다." />;
  }
}

// for SSG: generate all valid [identifier] params at build time
export async function generateStaticParams() {
  try {
    // sitemap을 사용하여 slug 기반 경로 생성
    const sitemap = await api.posts.getSitemap();

    if (sitemap && Array.isArray(sitemap)) {
      return sitemap.map(path => ({
        identifier: path.replace('/posts/', ''),
      }));
    }

    // 폴백: 게시글 목록에서 ID 생성
    const postsData = await api.posts.getList();
    if (!postsData?.content || !Array.isArray(postsData.content)) {
      return [];
    }

    return postsData.content.map(post => ({
      identifier: post.slug,
    }));
  } catch (error) {
    console.error('정적 경로 생성 중 오류:', error);
    return [];
  }
}

export const revalidate = 60;
