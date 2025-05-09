import { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { getCategoryName } from '@/lib/utils/category';
import { Category } from '@/types';

/**
 * UTC 날짜를 KST(UTC+9)로 변환하고 ISO 문자열로 반환
 */
function convertToKST(dateString: string): string {
  const date = new Date(dateString);
  // KST는 UTC+9
  date.setHours(date.getHours() + 9);
  return date.toISOString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 기본 페이지 URL 설정
  const baseUrl = 'https://bumsiku.kr';
  
  // 기본 페이지 경로
  const routes = ['', '/posts'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: convertToKST(new Date().toISOString()),
    changeFrequency: 'daily',
    priority: 1,
  })) as MetadataRoute.Sitemap;

  try {
    // 카테고리 정보 가져오기
    const categories = await api.categories.getList();
    
    // 카테고리 URL 추가
    const categoryUrls = categories.map((category: Category) => ({
      url: `${baseUrl}/posts?category=${category.id}`,
      lastModified: convertToKST(new Date().toISOString()),
      changeFrequency: 'weekly',
      priority: 0.9,
    })) as MetadataRoute.Sitemap;
    
    // 내부 API 클라이언트를 사용하여 게시물 데이터 가져오기 (최대 300개)
    const postsData = await api.posts.getList(0, 300);
    
    if (!postsData || !postsData.content) {
      console.error('No posts data available for sitemap');
      return [...routes, ...categoryUrls];
    }
    
    // 가져온 포스트 데이터를 사이트맵에 추가
    const postUrls = postsData.content.map((post) => {
      return {
        url: `${baseUrl}/posts/${post.id}`,
        lastModified: convertToKST(post.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    }) as MetadataRoute.Sitemap;

    return [...routes, ...categoryUrls, ...postUrls];
  } catch (error) {
    // API 호출 실패 시 기본 경로만 반환
    console.error('Failed to fetch data for sitemap:', error);
    console.error('Failed to fetch posts for sitemap:', error);
    return routes;
  }
} 