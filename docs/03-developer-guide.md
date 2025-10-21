# 개발자 가이드

## 개요

이 가이드는 프로젝트에 새로운 기능을 추가하거나 기존 기능을 수정하는 방법을 단계별로 설명합니다. 실무에서 바로 적용할 수 있는 구체적인 예제를 포함합니다.

## 개발 환경 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd blog-frontend
npm install
```

### 2. 환경 변수 설정

```bash
# .env.local 파일 생성
NEXT_PUBLIC_API_URL=https://api.bumsiku.kr
```

### 3. 개발 서버 실행

```bash
# HTTP 개발 서버 (일반 개발)
npm run dev

# HTTPS 개발 서버 (인증 테스트용)
npm run dev:https
```

### 4. 코드 품질 도구

```bash
# ESLint 검사
npm run lint

# Prettier 포맷팅
npm run format

# Prettier 검사 (CI/CD용)
npm run format:check

# 타입 체크 + 빌드
npm run build
```

## 새로운 기능 추가하기

### 예제: "좋아요(Like)" 기능 추가

이 예제를 통해 프로젝트의 전체 구조를 이해할 수 있습니다.

#### 1단계: Zod 스키마 정의

**파일**: `src/shared/types/schemas/like.schema.ts`

```typescript
import { z } from 'zod';

/**
 * 좋아요 스키마
 */
export const LikeSchema = z.object({
  id: z.number(),
  postId: z.number(),
  userId: z.string(),
  createdAt: z.string(),
});

/**
 * 좋아요 생성 요청 스키마
 */
export const CreateLikeSchema = z.object({
  postId: z.number(),
});

// 타입 추론
export type Like = z.infer<typeof LikeSchema>;
export type CreateLikeRequest = z.infer<typeof CreateLikeSchema>;
```

**파일**: `src/shared/types/schemas/index.ts`

```typescript
// 스키마 재export
export * from './like.schema';
```

#### 2단계: API 클라이언트 함수 작성

**파일**: `src/lib/api/likes.ts`

```typescript
import { APIClient } from './client';
import type { Like, CreateLikeRequest } from '@/shared/types/schemas';

const apiClient = APIClient.getInstance();

/**
 * 좋아요 API
 */
export const likesApi = {
  /**
   * 포스트 좋아요 목록 조회
   */
  getByPostId: async (postId: number): Promise<Like[]> => {
    return apiClient.request<Like[]>({
      method: 'GET',
      url: `/posts/${postId}/likes`,
    });
  },

  /**
   * 좋아요 생성
   */
  create: async (postId: number): Promise<Like> => {
    return apiClient.request<Like>({
      method: 'POST',
      url: `/posts/${postId}/likes`,
    });
  },

  /**
   * 좋아요 취소
   */
  delete: async (postId: number, likeId: number): Promise<void> => {
    return apiClient.request<void>({
      method: 'DELETE',
      url: `/posts/${postId}/likes/${likeId}`,
    });
  },

  /**
   * 현재 사용자의 좋아요 여부 확인
   */
  checkUserLike: async (postId: number): Promise<{ liked: boolean; likeId?: number }> => {
    return apiClient.request<{ liked: boolean; likeId?: number }>({
      method: 'GET',
      url: `/posts/${postId}/likes/me`,
    });
  },
};
```

**파일**: `src/lib/api/index.ts`

```typescript
// API 모듈 통합
export * from './likes';

export const api = {
  // 기존 API들...
  posts: postsApi,
  tags: tagsApi,
  comments: commentsApi,

  // 새로 추가
  likes: likesApi,
};
```

#### 3단계: SWR 조회 훅 작성

**파일**: `src/features/posts/hooks/useLikesQuery.ts`

```typescript
import useSWR from 'swr';
import { api } from '@/lib/api';

/**
 * 포스트 좋아요 목록 조회 훅
 */
export function useLikesQuery(postId: number) {
  return useSWR(
    postId ? ['likes', postId] : null,
    () => api.likes.getByPostId(postId)
  );
}

/**
 * 현재 사용자의 좋아요 여부 조회 훅
 */
export function useUserLikeQuery(postId: number) {
  return useSWR(
    postId ? ['like', 'user', postId] : null,
    () => api.likes.checkUserLike(postId)
  );
}
```

#### 4단계: Mutation 훅 작성

**파일**: `src/features/posts/mutations/useLikeMutations.ts`

```typescript
import { useSWRConfig } from 'swr';
import { useCallback } from 'react';
import { api } from '@/lib/api';

/**
 * 좋아요 생성 훅 (낙관적 업데이트)
 */
export function useCreateLike() {
  const { mutate } = useSWRConfig();

  return useCallback(async (postId: number) => {
    // 낙관적 업데이트: 즉시 liked = true로 변경
    mutate(
      ['like', 'user', postId],
      { liked: true, likeId: Date.now() },  // 임시 likeId
      false
    );

    try {
      const newLike = await api.likes.create(postId);

      // 성공: 서버 데이터로 재검증
      await mutate(['like', 'user', postId]);
      await mutate(['likes', postId]);  // 좋아요 목록도 재검증

      return newLike;
    } catch (error) {
      // 실패: 롤백
      await mutate(['like', 'user', postId]);
      throw error;
    }
  }, [mutate]);
}

/**
 * 좋아요 취소 훅 (낙관적 업데이트)
 */
export function useDeleteLike() {
  const { mutate } = useSWRConfig();

  return useCallback(async (postId: number, likeId: number) => {
    // 낙관적 업데이트: 즉시 liked = false로 변경
    mutate(
      ['like', 'user', postId],
      { liked: false },
      false
    );

    try {
      await api.likes.delete(postId, likeId);

      // 성공: 재검증
      await mutate(['like', 'user', postId]);
      await mutate(['likes', postId]);

    } catch (error) {
      // 실패: 롤백
      await mutate(['like', 'user', postId]);
      throw error;
    }
  }, [mutate]);
}
```

#### 5단계: UI 컴포넌트 작성

**파일**: `src/features/posts/components/LikeButton.tsx`

```typescript
'use client';

import { useUserLikeQuery } from '../hooks/useLikesQuery';
import { useCreateLike, useDeleteLike } from '../mutations/useLikeMutations';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface LikeButtonProps {
  postId: number;
  showCount?: boolean;
}

export function LikeButton({ postId, showCount = true }: LikeButtonProps) {
  const { data: userLike, isLoading } = useUserLikeQuery(postId);
  const createLike = useCreateLike();
  const deleteLike = useDeleteLike();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleLike = async () => {
    if (isProcessing || isLoading) return;

    setIsProcessing(true);
    try {
      if (userLike?.liked && userLike.likeId) {
        await deleteLike(postId, userLike.likeId);
      } else {
        await createLike(postId);
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isProcessing || isLoading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
        ${userLike?.liked
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <Heart
        className={`w-5 h-5 ${userLike?.liked ? 'fill-current' : ''}`}
      />
      {showCount && <span>{userLike?.likeCount || 0}</span>}
    </button>
  );
}
```

#### 6단계: 페이지에 통합

**파일**: `src/app/posts/[slug]/page.tsx`

```typescript
import { LikeButton } from '@/features/posts/components/LikeButton';

export default function PostDetailPage({ params }: { params: { slug: string } }) {
  const { data: post } = usePostQuery(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>

      {/* 좋아요 버튼 추가 */}
      <LikeButton postId={post.id} />
    </article>
  );
}
```

## 기존 기능 수정하기

### 예제: 포스트 조회수 증가 로직 추가

#### 1단계: API 함수 수정

**파일**: `src/lib/api/posts.ts`

```typescript
export const postsApi = {
  // 기존 함수들...

  /**
   * 포스트 조회수 증가
   */
  incrementViews: async (slug: string): Promise<void> => {
    return apiClient.request<void>({
      method: 'POST',
      url: `/posts/${slug}/views`,
    });
  },
};
```

#### 2단계: 페이지 컴포넌트에서 호출

**파일**: `src/app/posts/[slug]/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { usePostQuery } from '@/features/posts/hooks/usePostsQuery';
import { api } from '@/lib/api';

export default function PostDetailPage({ params }: { params: { slug: string } }) {
  const { data: post } = usePostQuery(params.slug);

  // 페이지 진입 시 조회수 증가
  useEffect(() => {
    if (params.slug) {
      api.posts.incrementViews(params.slug).catch(console.error);
    }
  }, [params.slug]);

  return (
    <article>
      <h1>{post.title}</h1>
      <div className="text-gray-500">조회수: {post.views}</div>
      <div>{post.content}</div>
    </article>
  );
}
```

## 새로운 페이지 추가하기

### 예제: "인기 포스트" 페이지 추가

#### 1단계: API 함수 작성

**파일**: `src/lib/api/posts.ts`

```typescript
export const postsApi = {
  // 기존 함수들...

  /**
   * 인기 포스트 목록 조회 (조회수 기준 정렬)
   */
  getPopular: async (limit: number = 10): Promise<PostSummary[]> => {
    return apiClient.request<PostSummary[]>({
      method: 'GET',
      url: '/posts/popular',
      params: { limit },
    });
  },
};
```

#### 2단계: SWR 훅 작성

**파일**: `src/features/posts/hooks/usePostsQuery.ts`

```typescript
/**
 * 인기 포스트 조회 훅
 */
export function usePopularPostsQuery(limit: number = 10) {
  return useSWR(['posts', 'popular', limit], () => api.posts.getPopular(limit));
}
```

#### 3단계: 페이지 컴포넌트 작성

**파일**: `src/app/popular/page.tsx`

```typescript
'use client';

import { usePopularPostsQuery } from '@/features/posts/hooks/usePostsQuery';
import { PostCard } from '@/components/blog/PostCard';

export default function PopularPostsPage() {
  const { data: posts, error, isLoading } = usePopularPostsQuery(20);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">인기 포스트</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts?.map((post, index) => (
          <div key={post.id} className="relative">
            {/* 순위 배지 */}
            <div className="absolute top-2 left-2 bg-yellow-400 text-white px-3 py-1 rounded-full font-bold">
              #{index + 1}
            </div>
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 4단계: 메타데이터 추가

**파일**: `src/app/popular/page.tsx` (동일 파일에 추가)

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '인기 포스트 | 기술 블로그',
  description: '조회수가 가장 높은 인기 포스트를 확인하세요.',
  openGraph: {
    title: '인기 포스트',
    description: '조회수가 가장 높은 인기 포스트를 확인하세요.',
    type: 'website',
  },
};
```

## 공통 컴포넌트 추가하기

### 예제: 공유 버튼 컴포넌트

#### 1단계: variant 정의 (선택사항)

**파일**: `src/shared/ui/variants/button.variants.ts`

```typescript
import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        // 새로 추가
        share: 'bg-green-600 text-white hover:bg-green-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);
```

#### 2단계: 컴포넌트 작성

**파일**: `src/components/ui/ShareButton.tsx`

```typescript
'use client';

import { Share2 } from 'lucide-react';
import { buttonVariants } from '@/shared/ui/variants/button.variants';
import { cn } from '@/shared/lib/cn';
import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  url?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'share';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ShareButton({
  title,
  url,
  variant = 'share',
  size = 'md',
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || window.location.href;

    // Web Share API 지원 확인
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      // 폴백: 클립보드 복사
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('복사 실패:', error);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      <Share2 className="w-4 h-4 mr-2" />
      {copied ? '복사됨!' : '공유하기'}
    </button>
  );
}
```

#### 3단계: 사용 예시

**파일**: `src/app/posts/[slug]/page.tsx`

```typescript
import { ShareButton } from '@/components/ui/ShareButton';

export default function PostDetailPage({ params }: { params: { slug: string } }) {
  const { data: post } = usePostQuery(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>

      <div className="flex gap-2 mt-4">
        <LikeButton postId={post.id} />
        <ShareButton title={post.title} />
      </div>

      <div>{post.content}</div>
    </article>
  );
}
```

## 유틸리티 함수 추가하기

### 예제: 날짜 포맷팅 함수

#### 파일: `src/lib/utils/date.ts`

```typescript
/**
 * ISO 날짜 문자열을 상대적 시간으로 변환
 * 예: "2시간 전", "3일 전"
 */
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}일 전`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}년 전`;
}

/**
 * ISO 날짜 문자열을 로케일 형식으로 변환
 * 예: "2024년 10월 21일"
 */
export function formatLocalDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

#### 사용 예시

```typescript
import { formatRelativeTime, formatLocalDate } from '@/lib/utils/date';

function PostCard({ post }: { post: PostSummary }) {
  return (
    <div>
      <h3>{post.title}</h3>
      <p className="text-gray-500">
        {formatRelativeTime(post.createdAt)}
      </p>
      <p className="text-sm text-gray-400">
        작성일: {formatLocalDate(post.createdAt)}
      </p>
    </div>
  );
}
```

## 에러 처리 패턴

### 1. 컴포넌트 레벨 에러 바운더리

**파일**: `src/components/ErrorBoundary.tsx` (이미 존재)

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-100 border border-red-400 rounded">
            <h2 className="text-red-800 font-bold">에러가 발생했습니다</h2>
            <p className="text-red-600">{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

**사용 예시**:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <PostList />
    </ErrorBoundary>
  );
}
```

### 2. SWR 에러 처리

```typescript
function PostList() {
  const { data, error, isLoading } = usePostsQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 rounded">
        <p className="text-red-800">
          데이터를 불러오는 중 오류가 발생했습니다: {error.message}
        </p>
        <button onClick={() => mutate(['posts'])}>
          다시 시도
        </button>
      </div>
    );
  }

  return <div>{/* 데이터 렌더링 */}</div>;
}
```

### 3. Mutation 에러 처리 (Toast 알림)

```typescript
'use client';

import { toast } from 'react-hot-toast';

function CreatePostForm() {
  const createPost = useCreatePost();

  const handleSubmit = async (data: CreatePostRequest) => {
    try {
      await createPost(data);
      toast.success('포스트가 생성되었습니다!');
      router.push('/admin/posts');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`생성 실패: ${error.message}`);
      } else {
        toast.error('알 수 없는 오류가 발생했습니다');
      }
    }
  };

  return <form onSubmit={handleSubmit}>{/* 폼 필드 */}</form>;
}
```

## 성능 최적화 가이드

### 1. 이미지 최적화

```typescript
import Image from 'next/image';

function PostThumbnail({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={400}
      placeholder="blur"  // 블러 플레이스홀더
      blurDataURL="data:image/jpeg;base64,..."  // LQIP
      priority={false}  // LCP 이미지만 true
      quality={85}  // 품질 조정 (기본 75)
    />
  );
}
```

### 2. 동적 import (코드 스플리팅)

```typescript
import dynamic from 'next/dynamic';

// 관리자 전용 컴포넌트는 필요할 때만 로드
const AdminEditor = dynamic(() => import('@/components/admin/Editor'), {
  loading: () => <p>에디터 로딩 중...</p>,
  ssr: false,  // 서버 사이드 렌더링 비활성화
});

function AdminPostEditPage() {
  return (
    <div>
      <h1>포스트 수정</h1>
      <AdminEditor />
    </div>
  );
}
```

### 3. React.memo로 불필요한 리렌더링 방지

```typescript
import { memo } from 'react';

interface PostCardProps {
  post: PostSummary;
}

export const PostCard = memo(function PostCard({ post }: PostCardProps) {
  return (
    <article>
      <h3>{post.title}</h3>
      <p>{post.summary}</p>
    </article>
  );
});
```

### 4. useMemo로 비싼 계산 캐싱

```typescript
import { useMemo } from 'react';

function PostList({ posts }: { posts: PostSummary[] }) {
  // 포스트를 태그별로 그룹화 (비싼 연산)
  const groupedByTag = useMemo(() => {
    return posts.reduce((acc, post) => {
      post.tags.forEach(tag => {
        if (!acc[tag]) acc[tag] = [];
        acc[tag].push(post);
      });
      return acc;
    }, {} as Record<string, PostSummary[]>);
  }, [posts]);  // posts가 변경될 때만 재계산

  return <div>{/* 그룹화된 포스트 렌더링 */}</div>;
}
```

## 테스팅 가이드

### 1. 컴포넌트 테스트 (예제)

```typescript
// PostCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PostCard } from './PostCard';

const mockPost = {
  id: 1,
  slug: 'test-post',
  title: 'Test Post',
  summary: 'Test summary',
  tags: ['test'],
  createdAt: '2024-10-21T00:00:00Z',
};

describe('PostCard', () => {
  it('renders post title', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders post summary', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test summary')).toBeInTheDocument();
  });
});
```

### 2. API 함수 테스트 (예제)

```typescript
// posts.test.ts
import { postsApi } from './posts';
import { APIClient } from './client';

jest.mock('./client');

describe('postsApi', () => {
  it('fetches posts list', async () => {
    const mockPosts = [{ id: 1, title: 'Test' }];

    (APIClient.getInstance().request as jest.Mock).mockResolvedValue(mockPosts);

    const result = await postsApi.getList(0, 10);
    expect(result).toEqual(mockPosts);
  });
});
```

## 배포 체크리스트

### 1. 빌드 전 체크

```bash
# 1. 타입 체크
npm run build

# 2. 린트 검사
npm run lint

# 3. 포맷팅 검사
npm run format:check
```

### 2. 환경 변수 확인

```bash
# 프로덕션 환경 변수 설정
NEXT_PUBLIC_API_URL=https://api.bumsiku.kr
NODE_ENV=production
```

### 3. 성능 체크

- Lighthouse 점수 확인 (목표: 90점 이상)
- 번들 사이즈 확인 (npm run build 출력)
- Core Web Vitals 확인

## 디버깅 팁

### 1. React DevTools 활용

```bash
# Chrome/Firefox 확장 프로그램 설치
React Developer Tools
```

**주요 기능**:
- 컴포넌트 트리 확인
- Props/State 실시간 확인
- 리렌더링 하이라이트

### 2. SWR DevTools 활용

```typescript
// app/layout.tsx (개발 환경)
import { SWRDevTools } from '@swr-devtools/react';

{process.env.NODE_ENV === 'development' && <SWRDevTools />}
```

**주요 기능**:
- 캐시 상태 확인
- 네트워크 요청 추적
- 재검증 타임라인

### 3. 브라우저 개발자 도구

```typescript
// API 요청 디버깅
console.log('API 요청:', { url, method, params });
console.log('API 응답:', { data, status });

// SWR 캐시 디버깅
console.log('SWR 캐시 키:', key);
console.log('SWR 데이터:', data);
```

## 자주 묻는 질문 (FAQ)

### Q1: 새로운 API 엔드포인트는 어디에 추가하나요?

**답변**: `src/lib/api/[domain].ts` 파일에 추가합니다.

```typescript
// src/lib/api/posts.ts
export const postsApi = {
  // 기존 함수들...

  // 새 엔드포인트 추가
  newEndpoint: async (): Promise<SomeType> => {
    return apiClient.request<SomeType>({
      method: 'GET',
      url: '/new-endpoint',
    });
  },
};
```

### Q2: 전역 상태 관리는 어떻게 하나요?

**답변**: 서버 상태는 SWR, 클라이언트 상태는 Context API나 Zustand를 사용합니다.

```typescript
// 서버 상태 (SWR)
const { data } = usePostsQuery();

// 클라이언트 상태 (Context API)
const ThemeContext = createContext('light');
```

### Q3: 환경 변수는 어떻게 사용하나요?

**답변**: `.env.local` 파일에 정의하고 `process.env`로 접근합니다.

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.bumsiku.kr
SECRET_KEY=xxxxx  # 클라이언트 노출 안 됨

# 사용
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Q4: 이미지 업로드는 어떻게 구현하나요?

**답변**: `useImageUpload` 훅을 사용합니다.

```typescript
import { useImageUpload } from '@/hooks/useImageUpload';

function EditorPage() {
  const { uploadImage, isUploading } = useImageUpload();

  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file);
    // 에디터에 이미지 URL 삽입
  };
}
```

## 참고 자료

- [Next.js 15 공식 문서](https://nextjs.org/docs)
- [React 19 공식 문서](https://react.dev)
- [SWR 공식 문서](https://swr.vercel.app)
- [TailwindCSS 공식 문서](https://tailwindcss.com)
- [TypeScript 공식 문서](https://www.typescriptlang.org)
- [Zod 공식 문서](https://zod.dev)
