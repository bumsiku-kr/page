// src/app/page.tsx
import { api } from '../lib/api/index';
import Container from '../components/ui/Container';
import HeroSection from '../components/sections/HeroSection';
import BlogSection from '../components/sections/BlogSection';
import Divider from '../components/ui/Divider';
import { PostListResponse, Category } from '../types';

type SearchParams = {
  page?: string;
  category?: string;
};

export default async function Home({
  // searchParams는 Promise로 들어올 수 있음을 명시
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // await로 풀어서 실제 파라미터 객체를 꺼냄
  const { page, category: cat } = await searchParams;

  // 페이지 번호와 카테고리 파싱
  const currentPage =
    typeof page === 'string' ? parseInt(page, 10) - 1 : 0;
  const category =
    typeof cat === 'string' ? parseInt(cat, 10) : undefined;

  // API 데이터 가져오기
  let postsData: PostListResponse = { content: [], totalElements: 0, pageNumber: 0, pageSize: 10 };
  let categoriesData: Category[] = [];

  try {
    [postsData, categoriesData] = await Promise.all([
      api.posts.getList(currentPage, 10, category),
      api.categories.getList(),
    ]);
  } catch (error) {
    console.error('데이터 로딩 중 오류 발생:', error);
  }

  return (
    <Container size="md">
      {/* 히어로 섹션 */}
      <HeroSection
        title="안녕하세요, SIKU(시쿠)입니다."
        subtitle={`건국대학교 컴퓨터공학부 3학년 재학중이며,\n서버 개발을 공부하며 다양한 경험과 배움을 포스팅에 기록하고 있습니다.`}
        imageSrc="/profile.jpg"
      />

      <Divider variant="border" />

      {/* 블로그 섹션 */}
      <BlogSection
        posts={postsData}
        categories={categoriesData}
        selectedCategory={category}
      />
    </Container>
  );
}