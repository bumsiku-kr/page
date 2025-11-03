import { MetadataRoute } from 'next';
import { api } from '@/lib/api/index';
import { defaultMetadata } from '@/lib/metadata';
import { SITE_URL, normalizeSiteUrl } from '@/lib/site';

// 주기적 갱신(Incremental Static Regeneration)
// SEO 최적화: 블로그 특성상 하루 1-2회 갱신이면 충분
// 3600초 = 1시간 (이전 5분은 너무 빈번했음)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 기본 페이지 URL 설정 (config에서 읽기)
  const baseCandidate =
    ((defaultMetadata.metadataBase as URL | undefined)?.origin as string | undefined) || SITE_URL;
  const baseUrl = normalizeSiteUrl(baseCandidate);

  try {
    // 백엔드 /sitemap API를 사용하여 최신 업데이트 순 slug 경로 리스트 조회
    const sitemapPaths = await api.posts.getSitemap();

    if (!Array.isArray(sitemapPaths)) {
      console.error('Invalid sitemap data format:', sitemapPaths);
      throw new Error('Invalid sitemap response format');
    }

    const currentTime = new Date().toISOString();

    // 기본 페이지 경로 (SEO 최적화된 priority와 changeFrequency)
    const routes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: currentTime,
        changeFrequency: 'daily',
        priority: 1.0, // 홈페이지는 최고 우선순위
      },
    ];

    // 백엔드에서 제공한 slug 경로들을 사이트맵에 추가
    // 백엔드가 이미 최신 업데이트 순으로 정렬해서 제공하므로
    // 순서에 따라 우선순위를 차등 적용
    const postUrls = sitemapPaths.map((path, index) => {
      // 백엔드에서 '/{slug}' 형태로 제공되므로 baseUrl과 결합
      const fullUrl = normalizeSiteUrl(path);

      // 최신 순서에 따른 우선순위 계산
      // 상위 10개는 높은 우선순위, 그 외는 기본 우선순위 적용
      let priority = 0.7; // 기본 우선순위
      if (index < 10) priority = 0.85; // 최신 10개 게시글
      if (index < 5) priority = 0.8; // 최신 5개 게시글

      return {
        url: fullUrl,
        lastModified: currentTime,
        changeFrequency: index < 30 ? 'weekly' : 'monthly', // 최신 30개는 주간, 나머지는 월간
        priority,
      };
    }) as MetadataRoute.Sitemap;

    return [...routes, ...postUrls];
  } catch (error) {
    // API 호출 실패 시 fallback 제공
    console.error('Failed to fetch sitemap from backend:', error);
    const fallbackNow = new Date().toISOString();

    // 기본 페이지들은 항상 포함 (SEO 최적화된 설정)
    return [
      {
        url: baseUrl,
        lastModified: fallbackNow,
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ] as MetadataRoute.Sitemap;
  }
}
