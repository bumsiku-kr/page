// src/app/page.tsx
import { api } from '../lib/api/index';
import { PostListResponse, Tag, SortOption } from '../types';
import { Metadata } from 'next';
import { homeMetadata, getTagMetadata } from '../lib/metadata';
import HomePage from '../components/pages/home';

type SearchParams = {
  page?: string;
  tag?: string;
  sort?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { tag } = await searchParams;

  // 태그가 없는 경우 기본 홈페이지 메타데이터 반환
  if (!tag) {
    return homeMetadata;
  }

  // 태그가 있는 경우 해당 태그의 메타데이터 생성
  try {
    const tags = await api.tags.getList();
    const selectedTag = tags.find(t => t.name === tag);

    if (selectedTag) return getTagMetadata(selectedTag.name);
  } catch (error) {
    console.error('태그 데이터 로딩 중 오류 발생:', error);
  }

  // 태그를 찾지 못한 경우 기본 홈페이지 메타데이터 반환
  return homeMetadata;
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { page, tag, sort } = await searchParams;

  const currentPage = typeof page === 'string' ? parseInt(page, 10) : 1;
  const sortOption = (sort as SortOption) || 'views,desc';

  let postsData: PostListResponse = { content: [], totalElements: 0, pageNumber: 0, pageSize: 5 };
  let tagsData: Tag[] = [];

  try {
    [postsData, tagsData] = await Promise.all([
      api.posts.getList(currentPage - 1, 5, tag, sortOption),
      api.tags.getList(),
    ]);
    // 정렬: 태그를 postCount 내림차순, 이름 오름차순으로 정렬 (SSR 안전)
    tagsData = tagsData.slice().sort((a, b) => {
      const byCount = (b.postCount || 0) - (a.postCount || 0);
      if (byCount !== 0) return byCount;
      // 안전한 문자열 정렬 (localeCompare 대신)
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
  } catch (error) {
    console.error('데이터 로딩 중 오류 발생:', error);
  }

  return (
    <HomePage
      initialPosts={postsData}
      initialTags={tagsData}
      initialPage={currentPage}
      initialTag={tag}
    />
  );
}

// Revalidate page every hour
export const revalidate = 3600;
