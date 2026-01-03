import { api } from '@/lib/api/index';
import { PostListResponse, Tag, SortOption } from '@/types';
import { Metadata } from 'next';
import { homeMetadata, getTagMetadata } from '@/lib/metadata';
import HomePage from '@/components/pages/home';
import { setRequestLocale } from 'next-intl/server';

type SearchParams = {
  page?: string;
  tag?: string;
  sort?: string;
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { tag } = await searchParams;

  if (!tag) {
    return homeMetadata;
  }

  try {
    const tags = await api.tags.getList();
    const selectedTag = tags.find((t) => t.name === tag);

    if (selectedTag) return getTagMetadata(selectedTag.name);
  } catch (error) {
    console.error('Error loading tag data:', error);
  }

  return homeMetadata;
}

export default async function Home({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page, tag, sort } = await searchParams;

  // Enable static rendering
  setRequestLocale(locale);

  const currentPage = typeof page === 'string' ? parseInt(page, 10) : 1;
  const sortOption = (sort as SortOption) || 'views,desc';

  let postsData: PostListResponse = { content: [], totalElements: 0, pageNumber: 0, pageSize: 5 };
  let tagsData: Tag[] = [];

  try {
    [postsData, tagsData] = await Promise.all([
      api.posts.getList(currentPage - 1, 5, tag, sortOption, locale),
      api.tags.getList(),
    ]);
    tagsData = tagsData.slice().sort((a, b) => {
      const byCount = (b.postCount || 0) - (a.postCount || 0);
      if (byCount !== 0) return byCount;
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
  } catch (error) {
    console.error('Error loading data:', error);
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

export const revalidate = 3600;
