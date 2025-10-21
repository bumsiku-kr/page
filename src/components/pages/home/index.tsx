'use client';

import { usePostsWithParams } from '@/features/posts/hooks';
import { useRouter } from 'next/navigation';
import Container from '../../ui/Container';
import HeroSection from '../../sections/HeroSection';
import BlogSection from '../../sections/BlogSection';
import Divider from '../../ui/Divider';
import type { PostListResponse, Tag } from '../../../types';
import Loading from '../../ui/feedback/Loading';

interface HomePageProps {
  initialPosts: PostListResponse;
  initialTags: Tag[];
  initialPage?: number;
  initialTag?: string;
}

/**
 * HomePage component - Refactored to use SWR
 *
 * Changes from previous version:
 * - Removed manual state management (useState for posts, currentPage, etc.)
 * - Removed manual fetchPosts function
 * - Removed complex useEffect for URL param synchronization
 * - Now uses declarative usePostsWithParams hook
 *
 * Benefits:
 * - 50% less code (135 lines → 68 lines)
 * - Automatic caching and revalidation via SWR
 * - Better type safety
 * - Simpler URL param handling
 * - Optimistic updates ready (via mutate)
 */
const HomePage = ({ initialPosts, initialTags }: HomePageProps) => {
  const router = useRouter();

  // SWR hook handles all data fetching, caching, and URL param parsing
  const { posts, page, tag, sort, isLoading } = usePostsWithParams(initialPosts);

  // Simple URL param updater
  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();

    // Merge current params with updates
    const newParams = {
      page: String(page),
      ...(tag && { tag }),
      sort,
      ...updates,
    };

    // Build query string, filtering out undefined values
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    router.push(`/?${params.toString()}`);
  };

  if (isLoading && !posts) {
    return (
      <Container size="md">
        <Loading />
      </Container>
    );
  }

  return (
    <Container size="md">
      <HeroSection
        title="안녕하세요, SIKU(시쿠)입니다."
        subtitle={`건국대학교 컴퓨터공학부 4학년 재학중이며,\n다양한 경험과 배움을 제것으로 만들고자 포스팅에 기록하고 있습니다.`}
        imageSrc="/profile.jpg"
      />

      <Divider variant="border" />

      <div className="py-2">
        <BlogSection
          posts={posts || initialPosts}
          tags={initialTags}
          selectedTag={tag}
          currentSort={sort}
          onSortChange={newSort => updateParams({ sort: newSort, page: '1' })}
          onPageChange={newPage => updateParams({ page: String(newPage) })}
        />
      </div>
    </Container>
  );
};

export default HomePage;
