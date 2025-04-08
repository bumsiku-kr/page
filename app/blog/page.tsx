import { api } from '../lib/api';
import CategorySidebar from '../components/CategorySidebar';
import PostList from '../components/PostList';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

// URL에서 페이지와 카테고리 파라미터 추출
export default async function BlogPage(props: any) {
  const searchParams = props.searchParams || {};
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const category = searchParams.category || undefined;
  
  try {
    // API 호출을 개별적으로 처리하고 각각의 오류를 개별 처리
    let postsData;
    let categoriesData;
    
    try {
      postsData = await api.posts.getPosts(currentPage, 10, category);
      console.log('성공적으로 게시물 데이터를 가져왔습니다:', postsData);
    } catch (err) {
      console.error('게시물 목록 로드 오류:', err);
      // 임시 테스트 데이터
      postsData = { 
        posts: [
          { 
            postId: 'temp-1', 
            title: 'API 연결 중입니다', 
            summary: '현재 API 서버와 연결 중입니다. 잠시만 기다려주세요.', 
            category: '공지', 
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content: ''
          }
        ], 
        currentPage: 1, 
        totalPages: 1, 
        totalCount: 1 
      };
    }
    
    try {
      categoriesData = await api.categories.getCategories();
      console.log('성공적으로 카테고리 데이터를 가져왔습니다:', categoriesData);
    } catch (err) {
      console.error('카테고리 목록 로드 오류:', err);
      // 임시 테스트 데이터
      categoriesData = { 
        categories: [
          { category: '전체', order: 0, createdAt: new Date().toISOString() },
          { category: '공지', order: 1, createdAt: new Date().toISOString() }
        ] 
      };
    }
    
    // 디버깅 로그
    console.log('처리된 Posts data:', JSON.stringify(postsData));
    console.log('처리된 Categories data:', JSON.stringify(categoriesData));
    
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
            <CategorySidebar 
              selectedCategory={category} 
              categories={categoriesData?.categories || []} 
            />
          </aside>

          {/* 게시글 목록 */}
          <main className="lg:w-3/4">
            <PostList 
              posts={postsData?.posts || []} 
              currentPage={postsData?.currentPage || 1}
              totalPages={postsData?.totalPages || 1}
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