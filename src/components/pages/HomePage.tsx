'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api/index';
import Container from '../ui/Container';
import HeroSection from '../sections/HeroSection';
import BlogSection from '../sections/BlogSection';
import Divider from '../ui/Divider';
import SortButton from '../blog/SortButton';
import { PostListResponse, Category, SortOption } from '../../types';
import ErrorMessage from '../ui/feedback/ErrorMessage';
import Loading from '../ui/feedback/Loading';

interface HomePageProps {
  initialPosts: PostListResponse;
  initialCategories: Category[];
  initialPage: number;
  initialCategory?: number;
}

const HomePage = ({
  initialPosts,
  initialCategories,
  initialPage,
  initialCategory,
}: HomePageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<PostListResponse>(initialPosts);
  const [categories] = useState<Category[]>(initialCategories);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(initialCategory);
  const [currentSort, setCurrentSort] = useState<SortOption>('createdAt,desc');
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async (
    page: number,
    category?: number,
    sort: SortOption = 'createdAt,desc'
  ) => {
    setIsLoading(true);
    try {
      const postsData = await api.posts.getList(page - 1, 5, category, sort);
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
    if (selectedCategory) {
      params.set('category', selectedCategory.toString());
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    params.set('sort', sort);

    router.push(`/?${params.toString()}`);
    fetchPosts(1, selectedCategory, sort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (selectedCategory) {
      params.set('category', selectedCategory.toString());
    } else {
      params.delete('category');
    }
    params.set('page', page.toString());
    params.set('sort', currentSort);

    router.push(`/?${params.toString()}`);
    fetchPosts(page, selectedCategory, currentSort);
    setCurrentPage(page);
  };

  useEffect(() => {
    const sortParam = searchParams.get('sort') as SortOption;
    const categoryParam = searchParams.get('category');
    const pageParam = searchParams.get('page');

    if (
      sortParam &&
      ['createdAt,desc', 'createdAt,asc', 'views,desc', 'views,asc'].includes(sortParam)
    ) {
      setCurrentSort(sortParam);
    }

    const newCategory = categoryParam ? parseInt(categoryParam, 10) : undefined;
    const newPage = pageParam ? parseInt(pageParam, 10) : 1;

    if (newCategory !== selectedCategory || newPage !== currentPage) {
      setSelectedCategory(newCategory);
      setCurrentPage(newPage);
      fetchPosts(newPage, newCategory, currentSort);
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
        subtitle={`건국대학교 컴퓨터공학부 4학년 재학중이며,\n서버 개발을 공부하며 다양한 경험과 배움을 포스팅에 기록하고 있습니다.`}
        imageSrc="/profile.jpg"
      />

      <Divider variant="border" />

      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">최근 게시글</h2>
          <SortButton
            currentSort={currentSort}
            onSortChange={handleSortChange}
            className="ml-auto"
          />
        </div>

        <BlogSection
          posts={posts}
          categories={categories}
          selectedCategory={selectedCategory}
          onPageChange={handlePageChange}
        />
      </div>
    </Container>
  );
};

export default HomePage;
