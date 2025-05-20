// src/lib/metadata.ts
import { Metadata } from 'next';

// 기본 사이트 정보
const siteName = 'Siku 기술블로그';
const siteUrl = 'https://bumsiku.kr';
const defaultDescription = 'Siku의 기술 블로그입니다.';
const defaultImagePath = '/profile.jpg';
const defaultAuthor = 'Siku';

// 기본 메타데이터 설정
export const defaultMetadata: Metadata = {
  title: siteName,
  description: defaultDescription,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: siteName,
    description: defaultDescription,
    url: siteUrl,
    siteName: siteName,
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: defaultImagePath,
        width: 800,
        height: 600,
        alt: `${defaultAuthor} 프로필 이미지`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: defaultDescription,
    creator: '@siku',
    images: [defaultImagePath],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// 홈페이지 메타데이터
export const homeMetadata: Metadata = {
  title: `${siteName} - 웹 개발과 서버 개발에 관한 이야기`,
  description: '건국대학교 컴퓨터공학부 학생의 서버 개발, 웹 개발 경험과 학습 내용을 공유하는 기술 블로그입니다.',
};

// 카테고리별 메타데이터 생성 함수
export function getCategoryMetadata(categoryName: string): Metadata {
  return {
    title: `${categoryName} | ${siteName}`,
    description: `${siteName}의 ${categoryName} 카테고리 글 모음입니다.`,
    openGraph: {
      title: `${categoryName} | ${siteName}`,
      description: `${siteName}의 ${categoryName} 카테고리 글 모음입니다.`,
      url: `${siteUrl}?category=${categoryName}`,
    },
  };
}

// 포트폴리오 페이지 메타데이터
export const portfolioMetadata: Metadata = {
  title: `${defaultAuthor}의 포트폴리오 | ${siteName}`,
  description: `건국대학교 컴퓨터공학부 학생 ${defaultAuthor}의 웹 개발 및 서버 개발 프로젝트 포트폴리오입니다.`,
  openGraph: {
    title: `${defaultAuthor}의 포트폴리오 | ${siteName}`,
    description: `건국대학교 컴퓨터공학부 학생 ${defaultAuthor}의 웹 개발 및 서버 개발 프로젝트 포트폴리오입니다.`,
    url: `${siteUrl}/portfolio`,
    type: 'profile',
  },
};

// 블로그 포스트 메타데이터 생성 함수
export function getPostMetadata(
  title: string, 
  description: string, 
  postId: number, 
  createdAt: string, 
  updatedAt: string
): Metadata {
  const url = `${siteUrl}/posts/${postId}`;
  
  return {
    title: `${title} | ${siteName}`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: createdAt,
      modifiedTime: updatedAt,
      authors: [defaultAuthor],
      siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@siku',
    },
    authors: [{ name: defaultAuthor }],
    robots: {
      index: true,
      follow: true,
    },
    other: {
      'ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        datePublished: createdAt,
        dateModified: updatedAt,
        author: {
          '@type': 'Person',
          name: defaultAuthor
        },
        description,
        mainEntityOfPage: url,
        publisher: {
          '@type': 'Organization',
          name: siteName,
          url: siteUrl
        }
      })
    }
  };
}
