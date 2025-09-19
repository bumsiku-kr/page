'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api/index';
import Container from '../ui/Container';
import HeroSection from '../sections/HeroSection';
import BlogSection from '../sections/BlogSection';
import Divider from '../ui/Divider';
import { PostListResponse, Tag, SortOption } from '../../types';
import ErrorMessage from '../ui/feedback/ErrorMessage';
import Loading from '../ui/feedback/Loading';

interface HomePageProps {
  initialPosts: PostListResponse;
  initialTags: Tag[];
  initialPage: number;
  initialTag?: string;
}

const HomePage = ({ initialPosts, initialTags, initialPage, initialTag }: HomePageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<PostListResponse>(initialPosts);
  const [tags] = useState<Tag[]>(initialTags);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(initialTag);
  const [currentSort, setCurrentSort] = useState<SortOption>('createdAt,desc');
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async (page: number, tag?: string, sort: SortOption = 'createdAt,desc') => {
    setIsLoading(true);
    try {
      const postsData = await api.posts.getList(page - 1, 5, tag, sort);
      setPosts(postsData);
    } catch (error) {
      console.error('게시글 로딩 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);

    const params = new URLSearchParams(searchParams);
    if (selectedTag) {
      params.set('tag', selectedTag);
    } else {
      params.delete('tag');
    }
    params.set('page', '1');
    params.set('sort', sort);

    router.push(`/?${params.toString()}`);
    fetchPosts(1, selectedTag, sort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (selectedTag) {
      params.set('tag', selectedTag);
    } else {
      params.delete('tag');
    }
    params.set('page', page.toString());
    params.set('sort', currentSort);

    router.push(`/?${params.toString()}`);
    fetchPosts(page, selectedTag, currentSort);
    setCurrentPage(page);
  };

  useEffect(() => {
    const sortParam = searchParams.get('sort') as SortOption;
    const tagParam = searchParams.get('tag') || undefined;
    const pageParam = searchParams.get('page');

    if (
      sortParam &&
      ['createdAt,desc', 'createdAt,asc', 'views,desc', 'views,asc'].includes(sortParam)
    ) {
      setCurrentSort(sortParam);
    }

    const newPage = pageParam ? parseInt(pageParam, 10) : 1;

    if (tagParam !== selectedTag || newPage !== currentPage) {
      setSelectedTag(tagParam);
      setCurrentPage(newPage);
      fetchPosts(newPage, tagParam, currentSort);
    }
  }, [searchParams]);

  if (isLoading) {
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
          posts={posts}
          tags={[...tags].sort((a, b) => {
            const byCount = (b.postCount || 0) - (a.postCount || 0);
            if (byCount !== 0) return byCount;
            // 안전한 문자열 정렬 (localeCompare 대신)
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
          })}
          selectedTag={selectedTag}
          currentSort={currentSort}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
        />
      </div>
    </Container>
  );
};

export default HomePage;
