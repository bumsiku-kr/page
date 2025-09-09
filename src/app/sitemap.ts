import { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { defaultMetadata } from '@/lib/metadata';
import { PostSummary, PostListResponse } from '@/types';

// 주기적 갱신(Incremental Static Regeneration)
// SEO 최적화: 블로그 특성상 하루 1-2회 갱신이면 충분
// 3600초 = 1시간 (이전 5분은 너무 빈번했음)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 기본 페이지 URL 설정 (config에서 읽기)
  const baseUrl =
    ((defaultMetadata.metadataBase as URL | undefined)?.origin as string | undefined) ||
    'https://bumsiku.kr';

  try {
    // 모든 게시물을 페이지네이션으로 수집 (서버 측 페이지 크기 제한 대응)
    const allPosts: PostSummary[] = [];
    let page = 0;
    let pageSize = 100; // 요청 희망 크기 (서버가 더 작게 줄 수 있음)
    let total = Infinity;

    while (allPosts.length < total) {
      const pageData: PostListResponse = await api.posts.getList(page, pageSize);

      if (!pageData || !Array.isArray(pageData.content)) {
        console.error('No posts data available for sitemap at page', page);
        break;
      }

      // 첫 페이지에서 서버가 반환한 실제 pageSize/totalElements를 기준으로 조정
      if (page === 0) {
        pageSize = pageData.pageSize || pageSize;
        total = pageData.totalElements ?? pageData.content.length;
      }

      // 더 이상 가져올 항목이 없으면 중단
      if (pageData.content.length === 0) break;

      allPosts.push(...pageData.content);

      // 다음 페이지로 이동
      page += 1;

      // 안전장치: 무한 루프 방지 (총합을 넘어서는 경우)
      if (page * pageSize > total + pageSize) break;
    }

    // 최신 업데이트 시각 계산 (UTC)
    const latestUpdatedAt =
      allPosts.reduce<string | undefined>((acc, post) => {
        const ts = new Date(post.updatedAt).toISOString();
        if (!acc) return ts;
        return ts > acc ? ts : acc;
      }, undefined) || new Date().toISOString();

    // 기본 페이지 경로 (SEO 최적화된 priority와 changeFrequency)
    const routes: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}`,
        lastModified: latestUpdatedAt,
        changeFrequency: 'daily',
        priority: 1.0, // 홈페이지는 최고 우선순위
      },
      {
        url: `${baseUrl}/posts`,
        lastModified: latestUpdatedAt,
        changeFrequency: 'daily',
        priority: 0.9, // 포스트 목록은 높은 우선순위
      },
    ];

    // 포스트 데이터를 사이트맵에 추가 (동적 우선순위 적용)
    const postUrls = allPosts.map(post => {
      // 최신성 기반 우선순위 계산 (최근 1개월 이내는 높은 우선순위)
      const postDate = new Date(post.updatedAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));

      let priority = 0.7; // 기본 우선순위
      if (daysDiff <= 30) priority = 0.8; // 최근 1개월
      if (daysDiff <= 7) priority = 0.85; // 최근 1주일

      // 업데이트 빈도 계산
      const createdAt = new Date(post.createdAt);
      const isRecent = daysDiff <= 30;
      const changeFrequency = isRecent ? 'weekly' : 'monthly';

      return {
        url: `${baseUrl}/posts/${post.id}`,
        lastModified: new Date(post.updatedAt).toISOString(),
        changeFrequency,
        priority,
      };
    }) as MetadataRoute.Sitemap;

    return [...routes, ...postUrls];
  } catch (error) {
    // API 호출 실패 시 더 강화된 fallback 제공
    console.error('Failed to fetch data for sitemap:', error);
    const fallbackNow = new Date().toISOString();

    // 기본 페이지들은 항상 포함 (SEO 최적화된 설정)
    return [
      {
        url: `${baseUrl}/`,
        lastModified: fallbackNow,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/posts`,
        lastModified: fallbackNow,
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ] as MetadataRoute.Sitemap;
  }
}
