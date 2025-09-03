// src/app/page.tsx
import { api } from '../lib/api/index';
import { PostListResponse, Category, SortOption } from '../types';
import { Metadata } from 'next';
import { homeMetadata, getCategoryMetadata } from '../lib/metadata';
import HomePage from '../components/pages/HomePage';

type SearchParams = {
  page?: string;
  category?: string;
  sort?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { category: cat } = await searchParams;
  const categoryId = typeof cat === 'string' ? parseInt(cat, 10) : undefined;

  // 카테고리가 없는 경우 기본 홈페이지 메타데이터 반환
  if (!categoryId) {
    return homeMetadata;
  }

  // 카테고리가 있는 경우 해당 카테고리의 메타데이터 생성
  try {
    const categories = await api.categories.getList();
    const selectedCategory = categories.find(c => c.id === categoryId);

    if (selectedCategory) {
      return getCategoryMetadata(selectedCategory.name);
    }
  } catch (error) {
    console.error('카테고리 데이터 로딩 중 오류 발생:', error);
  }

  // 카테고리를 찾지 못한 경우 기본 홈페이지 메타데이터 반환
  return homeMetadata;
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { page, category: cat, sort } = await searchParams;

  const currentPage = typeof page === 'string' ? parseInt(page, 10) : 1;
  const category = typeof cat === 'string' ? parseInt(cat, 10) : undefined;
  const sortOption = (sort as SortOption) || 'createdAt,desc';

  let postsData: PostListResponse = { content: [], totalElements: 0, pageNumber: 0, pageSize: 5 };
  let categoriesData: Category[] = [];

  try {
    [postsData, categoriesData] = await Promise.all([
      api.posts.getList(currentPage - 1, 5, category, sortOption),
      api.categories.getList(),
    ]);
  } catch (error) {
    console.error('데이터 로딩 중 오류 발생:', error);
  }

  return (
    <HomePage
      initialPosts={postsData}
      initialCategories={categoriesData}
      initialPage={currentPage}
      initialCategory={category}
    />
  );
}
