import { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { defaultMetadata } from '@/lib/metadata';
import { Tag, PostSummary, PostListResponse } from '@/types';

// 주기적 갱신(Incremental Static Regeneration)
// 초 단위. 필요 시 값 조정(예: 300=5분, 3600=1시간)
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 기본 페이지 URL 설정 (config에서 읽기)
  const baseUrl =
    ((defaultMetadata.metadataBase as URL | undefined)?.origin as string | undefined) ||
    'https://bumsiku.kr';

  try {
    // 태그 정보 가져오기
    const tags = await api.tags.getList();

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

    // 기본 페이지 경로 (정확한 lastModified 사용)
    const routes = ['', '/posts'].map(route => ({
      url: `${baseUrl}${route}`,
      lastModified: latestUpdatedAt,
      changeFrequency: 'daily',
      priority: 1,
    })) as MetadataRoute.Sitemap;

    // 태그별 최신 업데이트 시각 계산
    const tagLastUpdated = new Map<string, string>();
    for (const post of allPosts) {
      for (const tagName of post.tags || []) {
        const ts = new Date(post.updatedAt).toISOString();
        const prev = tagLastUpdated.get(tagName);
        if (!prev || ts > prev) tagLastUpdated.set(tagName, ts);
      }
    }

    // 태그 URL 추가 (가능하면 태그별 최신 업데이트 시각 사용)
    const tagUrls = tags.map((tag: Tag) => ({
      url: `${baseUrl}/posts?tag=${encodeURIComponent(tag.name)}`,
      lastModified: tagLastUpdated.get(tag.name) || latestUpdatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    })) as MetadataRoute.Sitemap;

    // 가져온 포스트 데이터를 사이트맵에 추가
    const postUrls = allPosts.map(post => {
      return {
        url: `${baseUrl}/posts/${post.id}`,
        lastModified: new Date(post.updatedAt).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    }) as MetadataRoute.Sitemap;

    return [...routes, ...tagUrls, ...postUrls];
  } catch (error) {
    // API 호출 실패 시 기본 경로만 반환
    console.error('Failed to fetch data for sitemap:', error);
    const fallbackNow = new Date().toISOString();
    return [
      { url: `${baseUrl}/`, lastModified: fallbackNow, changeFrequency: 'daily', priority: 1 },
      { url: `${baseUrl}/posts`, lastModified: fallbackNow, changeFrequency: 'daily', priority: 1 },
    ] as MetadataRoute.Sitemap;
  }
}
