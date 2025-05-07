import { api } from '../../lib/api';
import CategorySidebar from '../../components/blog/CategorySidebar';
import PostList from '../../components/blog/PostList';
import ErrorMessage from '../../components/ui/feedback/ErrorMessage';

interface SearchParams {
  page?: string;
  category?: string;
  [key: string]: string | string[] | undefined;
}

interface PageProps {
  searchParams?: Promise<SearchParams>;
}

// URL에서 페이지와 카테고리 파라미터 추출
export default async function BlogPage({ searchParams }: PageProps) {
  const params = await (searchParams || Promise.resolve<SearchParams>({}));

  const currentPage = typeof params.page === 'string' ? parseInt(params.page, 10) - 1 : 0; // 0-based pagination

  const category = typeof params.category === 'string' ? parseInt(params.category, 10) : undefined;

  try {
    // API 호출을 개별적으로 처리하고 각각의 오류를 개별 처리
    let postsData;
    let categoriesData;

    try {
      postsData = await api.posts.getList(currentPage, 10, category);
      console.log('성공적으로 게시물 데이터를 가져왔습니다:', postsData);
    } catch (err) {
      console.error('게시물 목록 로드 오류:', err);
      throw err;
    }

    try {
      categoriesData = await api.categories.getList();
      console.log('성공적으로 카테고리 데이터를 가져왔습니다:', categoriesData);
    } catch (err) {
      console.error('카테고리 목록 로드 오류:', err);
      throw err;
    }

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">블로그</h1>
          <p className="text-gray-600">
            프론트엔드 개발, React, TypeScript 그리고 UI/UX에 관련된 글을 공유합니다.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 사이드바 (카테고리) */}
          <aside className="lg:w-1/4">
            <CategorySidebar selectedCategory={category} categories={categoriesData || []} />
          </aside>

          {/* 게시글 목록 */}
          <main className="lg:w-3/4">
            <PostList
              posts={postsData?.content || []}
              currentPage={postsData?.pageNumber + 1 || 1}
              totalPages={Math.ceil((postsData?.totalElements || 0) / (postsData?.pageSize || 10))}
              categories={categoriesData || []}
            />
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error('블로그 데이터 로딩 중 오류 발생:', error);
    return <ErrorMessage message="블로그 게시물을 불러오는 중 오류가 발생했습니다." />;
  }
}
