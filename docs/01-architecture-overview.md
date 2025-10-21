# 블로그 프론트엔드 아키텍처 개요

## 시스템 구성

이 프로젝트는 **Next.js 15 App Router**를 기반으로 한 모던 블로그 웹 애플리케이션입니다. 타입 안전성, 확장성, 유지보수성을 중심으로 설계되었습니다.

### 핵심 기술 스택

```
프레임워크: Next.js 15 (React 19)
언어: TypeScript
스타일링: TailwindCSS + class-variance-authority
상태 관리: SWR (서버 상태)
폼 관리: react-hook-form + Zod
HTTP 클라이언트: Axios
마크다운: @uiw/react-md-editor
```

## 프로젝트 구조

### 계층별 책임 분리

```
blog-frontend/
├── src/
│   ├── app/                    # 라우팅 레이어
│   │   ├── page.tsx           # 홈페이지
│   │   ├── posts/             # 블로그 포스트 페이지
│   │   ├── admin/             # 관리자 대시보드
│   │   └── api/               # API 라우트
│   │
│   ├── features/              # 기능 모듈 (도메인 로직)
│   │   ├── auth/              # 인증 관련 로직
│   │   ├── posts/             # 포스트 관리 로직
│   │   ├── comments/          # 댓글 시스템
│   │   └── tags/              # 태그 시스템
│   │
│   ├── components/            # UI 컴포넌트
│   │   ├── admin/             # 관리자 전용 컴포넌트
│   │   ├── blog/              # 블로그 뷰 컴포넌트
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   └── ui/                # 재사용 가능한 UI 컴포넌트
│   │
│   ├── shared/                # 공유 인프라
│   │   ├── types/schemas/     # Zod 검증 스키마
│   │   ├── lib/               # 유틸리티 함수
│   │   └── ui/variants/       # UI variant 시스템
│   │
│   ├── lib/                   # 핵심 라이브러리
│   │   ├── api/               # API 클라이언트 & 엔드포인트
│   │   ├── utils/             # 범용 유틸리티
│   │   └── metadata.ts        # SEO 메타데이터
│   │
│   └── hooks/                 # 커스텀 React 훅
│
└── public/                    # 정적 자산
```

### 디렉토리 설계 원칙

#### 1. **Features 디렉토리 (도메인 중심)**

각 기능(feature)은 독립적인 모듈로 구성됩니다:

```
features/posts/
├── components/        # 포스트 관련 UI 컴포넌트
├── hooks/             # 포스트 데이터 훅 (usePostsQuery 등)
├── mutations/         # 포스트 변경 훅 (useCreatePost, useUpdatePost 등)
└── types/             # 포스트 타입 정의
```

**핵심 개념**:
- **도메인 격리**: 각 feature는 자신의 책임만 가짐
- **의존성 방향**: features → shared (공유 리소스 사용)
- **재사용성**: 여러 페이지에서 동일한 feature 사용 가능

#### 2. **Shared 디렉토리 (공유 인프라)**

프로젝트 전역에서 사용되는 리소스:

```
shared/
├── types/schemas/           # Zod 런타임 검증 스키마
│   └── post.schema.ts      # Post 스키마 정의
├── lib/
│   ├── cn.ts               # className 유틸리티
│   └── swr.ts              # SWR 전역 설정
└── ui/variants/            # CVA 기반 컴포넌트 variant
    ├── button.variants.ts
    └── input.variants.ts
```

**핵심 개념**:
- **타입 안전성**: Zod 스키마로 런타임 검증
- **일관성**: 전역 설정으로 프로젝트 전체에 일관된 동작 보장
- **재사용성**: 어디서나 import 가능한 순수 함수들

## 핵심 아키텍처 패턴

### 1. API 클라이언트 패턴 (Singleton + Interceptor)

**위치**: `src/lib/api/client.ts`

```typescript
// 싱글톤 패턴으로 전역에서 하나의 인스턴스만 사용
const apiClient = APIClient.getInstance();

// 인터셉터로 공통 로직 처리
- 요청: JWT 토큰 자동 주입
- 응답: 401 에러 시 자동 로그인 페이지 리다이렉트
- 에러: 재시도 로직 (최대 3회, exponential backoff)
```

**장점**:
- ✅ 중복 코드 제거 (인증 헤더를 매번 작성할 필요 없음)
- ✅ 전역 에러 핸들링 (한 곳에서 관리)
- ✅ 타입 안전성 (APIResponse<T> 제네릭)

### 2. SWR 기반 서버 상태 관리

**위치**: `src/features/posts/hooks/usePostsQuery.ts`

```typescript
// SWR로 데이터 페칭 + 캐싱 자동화
const { data, error, isLoading } = useSWR(
  '/posts',
  fetcher,
  {
    revalidateOnFocus: true,    // 탭 전환 시 재검증
    dedupingInterval: 5000,     // 5초 내 중복 요청 방지
  }
);
```

**장점**:
- ✅ 자동 캐싱 (서버 요청 최소화)
- ✅ 실시간 동기화 (탭 전환 시 최신 데이터 보장)
- ✅ 낙관적 업데이트 (UI 먼저 업데이트 후 서버 동기화)

### 3. Zod 기반 런타임 타입 검증

**위치**: `src/shared/types/schemas/post.schema.ts`

```typescript
// 스키마 정의
const PostSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9가-힣-]+$/),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  // ...
});

// 타입 추론 (TypeScript 타입을 스키마에서 자동 생성)
type Post = z.infer<typeof PostSchema>;
```

**장점**:
- ✅ 단일 진실 공급원 (스키마 = 타입 + 검증 로직)
- ✅ API 경계 보호 (잘못된 데이터 유입 차단)
- ✅ 명확한 에러 메시지 (사용자 친화적)

### 4. Feature-Based 아키텍처

각 기능은 독립적인 모듈로 구성:

```
features/posts/
├── components/          # UI 컴포넌트
├── hooks/               # 데이터 훅
│   ├── usePostsQuery.ts         # 조회
│   └── usePostsWithParams.ts    # 필터링
├── mutations/           # 변경 훅
│   ├── useCreatePost.ts
│   ├── useUpdatePost.ts
│   └── useDeletePost.ts
```

**장점**:
- ✅ 응집도 향상 (관련 코드가 한 곳에 모임)
- ✅ 결합도 감소 (features 간 독립성)
- ✅ 확장성 (새 기능 추가 시 격리된 디렉토리 생성)

### 5. Middleware 기반 인증 보호

**위치**: `src/middleware.ts`

```typescript
// 경로별 세션 검증
/admin/*   → 세션 없으면 /login 리다이렉트
/login     → 세션 있으면 /admin 리다이렉트
```

**장점**:
- ✅ 페이지 레벨 보호 (각 컴포넌트에서 인증 체크 불필요)
- ✅ 서버 사이드 검증 (클라이언트 우회 불가능)
- ✅ SEO 친화적 (미들웨어는 서버에서 실행)

## 데이터 흐름 아키텍처

```
사용자 액션
    ↓
React 컴포넌트
    ↓
Feature Hooks (usePostsQuery, useCreatePost 등)
    ↓
SWR (캐싱 + 재검증)
    ↓
API Client (APIClient.getInstance())
    ↓
Axios Interceptor (인증 + 에러 핸들링)
    ↓
백엔드 API (https://api.bumsiku.kr)
    ↓
Zod 검증 (응답 데이터)
    ↓
타입 안전한 데이터 → UI 렌더링
```

## 주요 설계 결정 (Architecture Decision Records)

### ADR-001: 왜 SWR을 선택했는가?

**문제**: 서버 상태 관리 라이브러리 선택 (SWR vs React Query vs Redux)

**결정**: SWR 채택

**이유**:
1. **경량성**: React Query보다 번들 사이즈 작음
2. **Next.js 통합**: Vercel에서 만들어 Next.js와 최적화된 통합
3. **단순성**: 대부분의 블로그 유즈케이스에 충분한 기능
4. **자동 캐싱**: 복잡한 설정 없이도 효율적인 캐싱

### ADR-002: 왜 Feature-Based 구조를 채택했는가?

**문제**: 프로젝트 구조 설계 (MVC vs Feature-Based vs Atomic Design)

**결정**: Feature-Based 구조 채택

**이유**:
1. **도메인 중심**: 비즈니스 로직이 기능별로 그룹화
2. **확장성**: 새 기능 추가 시 독립적인 디렉토리 생성
3. **팀 협업**: 기능별로 작업 분리 가능
4. **코드 탐색**: "포스트 관련 코드" → `features/posts/`로 직관적 탐색

### ADR-003: 왜 Zod를 타입 검증에 사용하는가?

**문제**: 런타임 타입 검증 라이브러리 선택 (Zod vs Yup vs Joi)

**결정**: Zod 채택

**이유**:
1. **타입 추론**: TypeScript 타입을 스키마에서 자동 생성
2. **경량성**: Yup보다 번들 사이즈 작음
3. **체이닝 API**: 읽기 쉬운 스키마 정의
4. **react-hook-form 통합**: @hookform/resolvers로 네이티브 지원

## 성능 최적화 전략

### 1. 이미지 최적화
- Next.js Image 컴포넌트 사용 (자동 WebP 변환)
- 반응형 이미지 (srcset 자동 생성)
- Lazy loading (viewport 진입 시 로드)

### 2. 코드 스플리팅
- 페이지별 자동 코드 스플리팅 (Next.js App Router)
- 동적 import (관리자 페이지는 필요시에만 로드)

### 3. 캐싱 전략
- SWR 캐싱 (5초 중복 제거)
- Axios 재시도 (네트워크 불안정성 대응)
- Next.js 정적 생성 (홈페이지, 포스트 목록)

### 4. 폰트 최적화
- Google Fonts preconnect (DNS 미리 연결)
- Noto Sans KR subset (한글 웹폰트 최적화)

## 보안 아키텍처

### 1. 인증 계층
```
Middleware (서버 사이드) → 경로 보호
    ↓
Axios Interceptor → JWT 토큰 주입
    ↓
API 엔드포인트 → 백엔드 인증 검증
```

### 2. XSS 방지
- react-markdown + rehype-sanitize (마크다운 HTML 정제)
- Next.js 자동 이스케이핑 (JSX 출력)

### 3. CSRF 방지
- withCredentials: true (쿠키 기반 세션)
- SameSite 쿠키 정책 (백엔드 설정)

## 개발 워크플로우

### 1. 새로운 기능 추가 시
```bash
1. features/ 디렉토리에 새 모듈 생성
2. Zod 스키마 정의 (shared/types/schemas/)
3. API 클라이언트 함수 작성 (lib/api/)
4. SWR 훅 작성 (features/[feature]/hooks/)
5. UI 컴포넌트 작성 (features/[feature]/components/)
6. 페이지에 통합 (app/)
```

### 2. 코드 품질 관리
```bash
npm run lint        # ESLint 검사
npm run format      # Prettier 포맷팅
npm run build       # 타입 체크 + 빌드
```

### 3. 개발 환경
```bash
npm run dev         # HTTP 개발 서버 (localhost:3000)
npm run dev:https   # HTTPS 개발 서버 (인증 테스트용)
```

## 확장 포인트

### 1. 새로운 인증 제공자 추가
- `lib/api/auth.ts`에 provider 로직 추가
- Middleware에서 세션 검증 로직 확장

### 2. 새로운 마크다운 플러그인 추가
- `components/blog/PostContent.tsx`에 rehype/remark 플러그인 추가

### 3. 새로운 API 엔드포인트 추가
- `lib/api/[domain].ts` 파일 생성
- API_ENDPOINTS 상수에 경로 추가
- APIClient.request() 메서드 사용

## 참고 자료

- [Next.js 15 문서](https://nextjs.org/docs)
- [SWR 문서](https://swr.vercel.app)
- [Zod 문서](https://zod.dev)
- [TailwindCSS 문서](https://tailwindcss.com)
