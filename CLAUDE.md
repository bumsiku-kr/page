# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 기반 블로그 프론트엔드 (React 19, TypeScript, TailwindCSS). 백엔드 API (`https://api.bumsiku.kr`)와 통신하여 블로그 포스트, 댓글, 태그를 관리합니다.

## Development Commands

```bash
# Development
npm run dev              # HTTP 개발 서버 (localhost:3000)
npm run dev:https        # HTTPS 개발 서버 (인증 테스트용)

# Build & Production
npm run build            # 타입 체크 + 프로덕션 빌드
npm start                # 프로덕션 서버 실행

# Code Quality
npm run lint             # ESLint 검사
npm run format           # Prettier 포맷팅 (자동 수정)
npm run format:check     # Prettier 검사 (CI/CD용)
```

## Architecture Overview

### Directory Structure

```
src/
├── app/                    # Next.js 15 App Router (페이지 라우팅)
│   ├── posts/             # 블로그 포스트 페이지
│   ├── admin/             # 관리자 대시보드
│   └── api/               # API 라우트 핸들러
│
├── features/              # Feature-based 모듈 (도메인 로직)
│   ├── auth/              # 인증
│   ├── posts/             # 포스트 (hooks, mutations, components)
│   ├── comments/          # 댓글
│   └── tags/              # 태그
│
├── components/            # UI 컴포넌트
│   ├── admin/             # 관리자 전용
│   ├── blog/              # 블로그 뷰
│   ├── layout/            # 레이아웃
│   └── ui/                # 재사용 가능한 UI
│
├── shared/                # 공유 인프라
│   ├── types/schemas/     # Zod 런타임 검증 스키마
│   ├── lib/               # 유틸리티 (cn, swr 설정)
│   └── ui/variants/       # CVA 기반 컴포넌트 variant
│
├── lib/                   # 핵심 라이브러리
│   ├── api/               # API 클라이언트 & 서비스 레이어
│   │   ├── client.ts      # APIClient 싱글톤 (Axios)
│   │   ├── posts.ts       # PostsService
│   │   ├── auth.ts        # AuthService
│   │   └── index.ts       # 통합 api 객체
│   ├── utils/             # 범용 유틸리티
│   └── metadata.ts        # SEO 메타데이터
│
├── hooks/                 # 전역 커스텀 훅
├── middleware.ts          # 인증 미들웨어 (경로 보호)
└── types/                 # 전역 타입 정의
```

### Key Architectural Patterns

#### 1. Feature-Based Architecture

각 기능(`features/`)은 독립적인 모듈:

```
features/posts/
├── components/          # 포스트 UI 컴포넌트
├── hooks/               # SWR 조회 훅 (usePostsQuery 등)
├── mutations/           # 변경 훅 (useCreatePost, useUpdatePost 등)
└── types/               # 포스트 관련 타입
```

**규칙**:
- Features 간 직접 import 금지 (shared를 통해 공유)
- 각 feature는 자신의 도메인 로직만 담당
- `shared/`는 features에서 공통으로 사용하는 리소스

#### 2. API Client Layer (Singleton Pattern)

**위치**: `src/lib/api/client.ts`

```typescript
// 싱글톤 인스턴스 사용
const apiClient = APIClient.getInstance();

// 서비스 클래스로 도메인별 API 분리
class PostsService {
  constructor(private client: APIClient) {}

  async getList(page, size, tag?, sort?) {
    return this.client.request<PostListResponse>({
      method: 'GET',
      url: '/posts',
      params: { page, size, tag, sort }
    });
  }
}
```

**특징**:
- Axios 인터셉터로 JWT 토큰 자동 주입 (요청)
- 401 에러 시 자동 로그인 리다이렉트 (응답)
- 재시도 로직 (exponential backoff, 최대 3회)
- 타입 안전성 (`APIResponse<T>` 제네릭)

**통합 API 객체**: `src/lib/api/index.ts`

```typescript
export const api = {
  posts: postsService,
  tags: tagsService,
  comments: commentsService,
  images: imagesService,
  auth: authService,
  ai: aiService,
};
```

#### 3. SWR-based Server State Management

**전역 설정**: `src/shared/lib/swr.ts`

```typescript
{
  revalidateOnFocus: false,        // 탭 전환 시 재검증 비활성화
  revalidateOnReconnect: true,     // 네트워크 재연결 시 재검증
  dedupingInterval: 2000,          // 2초 내 중복 요청 방지
  keepPreviousData: true,          // 재검증 중 이전 데이터 유지
  errorRetryCount: 3,              // 최대 3회 재시도
  onErrorRetry: exponentialBackoff // 지수 백오프 재시도
}
```

**조회 훅**: `features/posts/hooks/usePostsQuery.ts`

```typescript
export function usePostsQuery(page = 0, size = 10, sort = 'createdAt,desc') {
  return useSWR(
    ['posts', page, size, sort],  // 캐시 키 (복합 키)
    () => api.posts.getList(page, size, undefined, sort)
  );
}
```

**Mutation 훅** (낙관적 업데이트): `features/posts/mutations/useCreatePost.ts`

```typescript
export function useCreatePost() {
  const { mutate } = useSWRConfig();

  return useCallback(async (input: CreatePostRequest) => {
    // 1. 낙관적 업데이트: 임시 포스트를 캐시에 즉시 추가
    mutate(
      (key) => key.includes('posts'),
      (current) => ({ ...current, content: [optimisticPost, ...current.content] }),
      false  // 재검증 안 함
    );

    try {
      // 2. 서버 요청
      const newPost = await api.posts.create(input);

      // 3. 성공: 서버 데이터로 재검증
      await mutate((key) => key.includes('posts'));

      return newPost;
    } catch (error) {
      // 4. 실패: 캐시 롤백
      await mutate((key) => key.includes('posts'));
      throw error;
    }
  }, [mutate]);
}
```

#### 4. Zod Runtime Type Validation

**위치**: `src/shared/types/schemas/post.schema.ts`

```typescript
export const PostSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9가-힣-]+$/),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  summary: z.string().min(1).max(200),
  tags: z.array(z.string()),
  // ...
});

// TypeScript 타입을 스키마에서 자동 추론
export type Post = z.infer<typeof PostSchema>;
```

**react-hook-form 통합**:

```typescript
const form = useForm({
  resolver: zodResolver(PostSchema),  // Zod 스키마로 자동 검증
  defaultValues: { /* ... */ }
});
```

#### 5. Middleware-based Authentication

**위치**: `src/middleware.ts`

```typescript
export function middleware(request: NextRequest) {
  const hasSession = /* 쿠키 검증 */;

  // /admin/* → 세션 없으면 /login 리다이렉트
  if (pathname.startsWith('/admin') && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // /login → 세션 있으면 /admin 리다이렉트
  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
```

## Development Guidelines

### Adding a New Feature

**예제**: 좋아요(Like) 기능 추가

1. **Zod 스키마 정의**: `shared/types/schemas/like.schema.ts`
2. **API 서비스 작성**: `lib/api/likes.ts` (LikesService 클래스)
3. **API 통합**: `lib/api/index.ts`에 `likes: likesService` 추가
4. **SWR 조회 훅**: `features/posts/hooks/useLikesQuery.ts`
5. **Mutation 훅**: `features/posts/mutations/useLikeMutations.ts` (useCreateLike, useDeleteLike)
6. **UI 컴포넌트**: `features/posts/components/LikeButton.tsx`
7. **페이지 통합**: `app/posts/[slug]/page.tsx`에서 사용

### Code Style Rules

`.cursor/rules/default.mdc`에서 추출한 핵심 규칙:

- **Early returns**: 가독성을 위해 early return 패턴 사용
- **Tailwind only**: CSS 대신 Tailwind 클래스만 사용
- **Event handlers**: `handle` 접두사 사용 (handleClick, handleKeyDown)
- **Accessibility**: tabindex, aria-label 등 접근성 속성 구현
- **Consts over functions**: `const toggle = () => {}` 형태 선호
- **No placeholders**: TODO 주석, 미완성 코드 금지 (완전한 구현만)

### Path Aliases

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**사용 예시**:

```typescript
import { api } from '@/lib/api';
import { cn } from '@/shared/lib/cn';
import { PostSchema } from '@/shared/types/schemas';
```

### API Integration Pattern

```typescript
// 1. Service 클래스 작성 (lib/api/domain.ts)
export class DomainService {
  constructor(private client: APIClient) {}

  async someMethod() {
    return this.client.request<ResponseType>({
      method: 'GET',
      url: '/endpoint'
    });
  }
}

// 2. api 객체에 통합 (lib/api/index.ts)
const domainService = new DomainService(apiClient);

export const api = {
  // 기존 서비스들...
  domain: domainService,
};

// 3. SWR 훅 작성 (features/domain/hooks/useDomainQuery.ts)
export function useDomainQuery() {
  return useSWR(['domain'], () => api.domain.someMethod());
}

// 4. 컴포넌트에서 사용
const { data, error, isLoading } = useDomainQuery();
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.bumsiku.kr
```

**주의**: `NEXT_PUBLIC_` 접두사가 있어야 클라이언트에서 접근 가능

### Production Build Configuration

`next.config.mjs`:

- `removeConsole`: 프로덕션에서 모든 console.* 제거
- `serverActions.bodySizeLimit`: 20MB (이미지 업로드용)
- `removeImports`: 마크다운 에디터 최적화

## Testing Authentication Flow

```bash
# HTTPS 개발 서버 실행 (인증 쿠키 테스트용)
npm run dev:https

# 로그인: https://localhost:3000/login
# 관리자: https://localhost:3000/admin
```

**인증 흐름**:
1. `/login` 접속 → 로그인 폼
2. 로그인 성공 → 쿠키 저장 (JSESSIONID, SESSION 등)
3. Middleware가 쿠키 검증
4. `/admin` 접근 가능

## Common Pitfalls

### ❌ 잘못된 패턴

```typescript
// Feature 간 직접 import
import { usePostsQuery } from '@/features/posts/hooks/usePostsQuery';  // features/comments에서

// Zod 스키마 없이 타입만 정의
interface Post { /* ... */ }  // 런타임 검증 불가능

// Mutation 없이 직접 API 호출
await api.posts.create(data);  // SWR 캐시 무효화 안 됨

// CSS 사용
<div style={{ color: 'red' }}>  // Tailwind 사용 필요
```

### ✅ 올바른 패턴

```typescript
// shared를 통한 공유
import { PostSchema } from '@/shared/types/schemas';

// Zod 스키마로 타입 + 검증
const PostSchema = z.object({ /* ... */ });
type Post = z.infer<typeof PostSchema>;

// Mutation 훅 사용
const createPost = useCreatePost();
await createPost(data);  // 캐시 자동 무효화

// Tailwind 클래스 사용
<div className="text-red-500">
```

## Documentation

상세 기술 문서는 `docs/` 디렉토리 참조:

- `01-architecture-overview.md`: 전체 아키텍처 및 설계 결정
- `02-data-flow-and-state-management.md`: SWR, API 클라이언트, 폼 관리
- `03-developer-guide.md`: 실무 개발 가이드 (기능 추가, 성능 최적화, 디버깅)
