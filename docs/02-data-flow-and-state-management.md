# 데이터 흐름 및 상태 관리

## 개요

이 프로젝트는 **SWR (Stale-While-Revalidate)** 를 사용하여 서버 상태를 관리합니다. SWR은 클라이언트 캐싱, 자동 재검증, 낙관적 업데이트를 제공하는 React 훅 라이브러리입니다.

### 핵심 개념

```
서버 상태 (SWR) ← API 클라이언트 → 백엔드 API
       ↓
   UI 컴포넌트
       ↓
  사용자 인터페이스
```

## SWR 전역 설정

**위치**: `src/shared/lib/swr.ts`

### 주요 설정 값

```typescript
{
  // 1. 자동 재검증 제어
  revalidateOnFocus: false,        // 탭 전환 시 재검증 비활성화 (UX 개선)
  revalidateOnReconnect: true,     // 네트워크 재연결 시 재검증 활성화

  // 2. 에러 처리
  shouldRetryOnError: true,        // 에러 발생 시 재시도
  errorRetryCount: 3,              // 최대 3회 재시도
  errorRetryInterval: 5000,        // 5초 간격으로 재시도

  // 3. 성능 최적화
  dedupingInterval: 2000,          // 2초 내 중복 요청 방지
  keepPreviousData: true,          // 재검증 중에도 이전 데이터 유지 (깜빡임 방지)
}
```

### 재시도 로직 (Exponential Backoff)

```typescript
onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
  // 404, 401은 재시도 안 함 (의미 없음)
  if (error.status === 404 || error.status === 401) return;

  // 최대 5회까지만 재시도
  if (retryCount >= 5) return;

  // 지수 백오프: 1초 → 2초 → 4초 → 8초 → 16초
  setTimeout(() => revalidate({ retryCount }), Math.pow(2, retryCount) * 1000);
}
```

**동작 예시**:
```
1차 시도 실패 → 1초 대기 → 2차 시도
2차 시도 실패 → 2초 대기 → 3차 시도
3차 시도 실패 → 4초 대기 → 4차 시도
...
```

## 데이터 조회 (Query) 패턴

### 1. 기본 조회 패턴

**위치**: `src/features/posts/hooks/usePostsQuery.ts`

```typescript
// 포스트 목록 조회
export function usePostsQuery(page = 0, size = 10, sort = 'createdAt,desc') {
  return useSWR(
    ['posts', page, size, sort],  // 캐시 키 (복합 키)
    () => api.posts.getList(page, size, undefined, sort)  // fetcher 함수
  );
}

// 사용 예시
const { data, error, isLoading } = usePostsQuery(0, 10);
```

### 캐시 키 설계

SWR은 캐시 키로 데이터를 식별합니다. 복합 키를 사용하면 다른 매개변수마다 독립적인 캐시를 가집니다.

```typescript
// 각각 다른 캐시를 가짐
['posts', 0, 10, 'createdAt,desc']  // 1페이지, 생성일 정렬
['posts', 1, 10, 'createdAt,desc']  // 2페이지, 생성일 정렬
['posts', 0, 10, 'views,desc']      // 1페이지, 조회수 정렬
```

### 2. 조건부 조회 패턴

```typescript
// 태그가 있을 때만 조회
export function usePostsByTagQuery(tag, page = 0, size = 10, sort = 'createdAt,desc') {
  return useSWR(
    tag ? ['posts', 'tag', tag, page, size, sort] : null,  // tag 없으면 null → 조회 안 함
    () => api.posts.getList(page, size, tag, sort)
  );
}

// 슬러그가 있을 때만 조회
export function usePostQuery(slug) {
  return useSWR(
    slug ? ['post', slug] : null,  // slug 없으면 조회 안 함
    () => api.posts.getBySlug(slug)
  );
}
```

**동작 원리**:
- 캐시 키가 `null`이면 SWR은 데이터를 조회하지 않음
- 조건이 충족되면 (예: slug가 설정됨) 자동으로 데이터 조회 시작

### 3. 프리페칭 (Prefetching) 패턴

**위치**: `src/features/posts/hooks/usePrefetchPost.ts`

```typescript
export function usePrefetchPost() {
  const { mutate } = useSWRConfig();

  return useCallback((slug: string) => {
    // 캐시에 미리 데이터 로드 (백그라운드에서)
    mutate(['post', slug], () => api.posts.getBySlug(slug));
  }, [mutate]);
}

// 사용 예시: 마우스 호버 시 미리 로드
<Link
  href={`/posts/${post.slug}`}
  onMouseEnter={() => prefetchPost(post.slug)}
>
  {post.title}
</Link>
```

**효과**:
- 사용자가 링크를 클릭하기 전에 미리 데이터를 로드
- 페이지 전환이 즉시 일어나는 것처럼 보임 (UX 개선)

## 데이터 변경 (Mutation) 패턴

### 1. 낙관적 업데이트 (Optimistic Update)

**위치**: `src/features/posts/mutations/useCreatePost.ts`

낙관적 업데이트는 서버 응답을 기다리지 않고 UI를 먼저 업데이트하는 패턴입니다.

#### 동작 흐름

```
1. 사용자 액션 (포스트 생성 버튼 클릭)
   ↓
2. 임시 포스트를 캐시에 추가 (즉시 UI 반영)
   ↓
3. 서버에 실제 요청 전송
   ↓
4. 성공: 서버 데이터로 캐시 교체
   실패: 캐시 롤백 (이전 상태로 복구)
```

#### 실제 코드

```typescript
export function useCreatePost() {
  const { mutate } = useSWRConfig();

  return useCallback(async (input: CreatePostRequest) => {
    // 1단계: 임시 포스트 생성
    const optimisticPost = {
      id: Date.now(),  // 임시 ID (타임스탬프)
      slug: input.slug,
      title: input.title,
      content: input.content,
      // ...
    };

    // 2단계: 캐시에 즉시 추가 (UI 먼저 업데이트)
    mutate(
      (key) => typeof key === 'string' && key.includes('posts'),
      (current) => ({
        ...current,
        content: [optimisticPost, ...current.content],  // 맨 앞에 추가
        totalElements: current.totalElements + 1,
      }),
      false  // 재검증 안 함 (아직 서버 요청 전)
    );

    try {
      // 3단계: 서버에 실제 생성 요청
      const newPost = await api.posts.create(input);

      // 4단계: 성공 시 서버 데이터로 재검증
      await mutate((key) => typeof key === 'string' && key.includes('posts'));

      return newPost;
    } catch (error) {
      // 5단계: 실패 시 캐시 롤백 (이전 상태로 복구)
      await mutate((key) => typeof key === 'string' && key.includes('posts'));
      throw error;
    }
  }, [mutate]);
}
```

### 2. 업데이트 Mutation

**위치**: `src/features/posts/mutations/useUpdatePost.ts`

```typescript
export function useUpdatePost() {
  const { mutate } = useSWRConfig();

  return useCallback(async (id: number, input: UpdatePostRequest) => {
    // 낙관적 업데이트 (기존 포스트 수정)
    mutate(
      ['post', id],
      { ...currentPost, ...input },  // 기존 데이터 + 새 데이터 병합
      false
    );

    try {
      const updatedPost = await api.posts.update(id, input);
      await mutate(['post', id]);  // 서버 데이터로 재검증
      return updatedPost;
    } catch (error) {
      await mutate(['post', id]);  // 롤백
      throw error;
    }
  }, [mutate]);
}
```

### 3. 삭제 Mutation

**위치**: `src/features/posts/mutations/useDeletePost.ts`

```typescript
export function useDeletePost() {
  const { mutate } = useSWRConfig();

  return useCallback(async (id: number) => {
    // 낙관적 업데이트 (목록에서 즉시 제거)
    mutate(
      (key) => typeof key === 'string' && key.includes('posts'),
      (current) => ({
        ...current,
        content: current.content.filter(post => post.id !== id),
        totalElements: current.totalElements - 1,
      }),
      false
    );

    try {
      await api.posts.delete(id);
      await mutate((key) => typeof key === 'string' && key.includes('posts'));
    } catch (error) {
      await mutate((key) => typeof key === 'string' && key.includes('posts'));
      throw error;
    }
  }, [mutate]);
}
```

## API 클라이언트 계층

### APIClient 구조

**위치**: `src/lib/api/client.ts`

```typescript
class APIClient {
  private client: AxiosInstance;
  private static instance: APIClient;  // 싱글톤 패턴

  // 생성자 (private으로 외부 생성 방지)
  private constructor() {
    this.client = axios.create({
      baseURL: 'https://api.bumsiku.kr',
      withCredentials: true,  // 쿠키 포함
      timeout: 60000,  // 60초 타임아웃
    });

    this.setupInterceptors();
  }

  // 싱글톤 인스턴스 반환
  public static getInstance() {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }
}
```

### 인터셉터 (Interceptor) 동작

#### 요청 인터셉터

```typescript
this.client.interceptors.request.use(
  config => {
    // 1. JWT 토큰 자동 주입
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 2. 요청 로깅 (디버깅)
    logger.debug('API 요청', {
      url: config.url,
      method: config.method,
      params: config.params,
    });

    return config;
  }
);
```

**효과**:
- 모든 API 요청에 자동으로 인증 헤더 추가
- 각 컴포넌트에서 토큰을 수동으로 추가할 필요 없음

#### 응답 인터셉터

```typescript
this.client.interceptors.response.use(
  response => response,  // 성공 시 그대로 반환
  error => {
    // 401 에러 (인증 실패) 시 자동 리다이렉트
    if (error?.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

**효과**:
- 인증 만료 시 자동으로 로그인 페이지로 이동
- 각 컴포넌트에서 401 에러 처리할 필요 없음

### 재시도 로직 (Retry Logic)

```typescript
private async retryRequest<T>(config, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await this.client.request<T>(config);
    } catch (error) {
      lastError = error;

      // 마지막 시도가 아니면 지수 백오프 대기
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;  // 1초 → 2초 → 4초
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;  // 모든 시도 실패 시 에러 던지기
}
```

**효과**:
- 네트워크 불안정 시 자동으로 재시도
- 일시적인 네트워크 오류에도 안정적으로 동작

## 폼 관리 (Form State)

### React Hook Form + Zod 통합

**위치**: `src/features/posts/hooks/usePostForm.ts`

```typescript
const formSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9가-힣-]+$/),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  summary: z.string().min(1).max(200),
  tags: z.array(z.string()),
});

const form = useForm({
  resolver: zodResolver(formSchema),  // Zod 스키마로 자동 검증
  defaultValues: {
    slug: '',
    title: '',
    content: '',
    summary: '',
    tags: [],
  },
});

// 제출 핸들러
const onSubmit = form.handleSubmit(async (data) => {
  try {
    await createPost(data);  // Mutation 호출
    toast.success('포스트가 생성되었습니다.');
    router.push('/admin/posts');
  } catch (error) {
    toast.error(error.message);
  }
});
```

### 실시간 검증

```typescript
// 입력 시 자동 검증
<input
  {...form.register('title')}  // 자동으로 onChange, onBlur 바인딩
  className={form.formState.errors.title ? 'border-red-500' : ''}
/>

// 에러 메시지 표시
{form.formState.errors.title && (
  <p className="text-red-500">{form.formState.errors.title.message}</p>
)}
```

## 전체 데이터 흐름 시나리오

### 시나리오 1: 포스트 목록 조회

```
1. 컴포넌트 마운트
   ↓
2. usePostsQuery() 호출
   ↓
3. SWR 캐시 확인
   - 캐시 있음: 즉시 반환 (stale) + 백그라운드 재검증
   - 캐시 없음: 로딩 상태 → API 요청
   ↓
4. APIClient.request() 호출
   ↓
5. Axios 요청 인터셉터 (토큰 주입)
   ↓
6. 백엔드 API 호출
   ↓
7. 응답 인터셉터 (에러 처리)
   ↓
8. SWR 캐시 업데이트
   ↓
9. 컴포넌트 리렌더링 (새 데이터 표시)
```

### 시나리오 2: 포스트 생성 (낙관적 업데이트)

```
1. 폼 제출 버튼 클릭
   ↓
2. useCreatePost() Mutation 호출
   ↓
3. 임시 포스트를 SWR 캐시에 추가
   ↓
4. UI 즉시 업데이트 (새 포스트 표시)
   ↓
5. 백그라운드에서 API 요청 전송
   ↓
6. 성공:
   - 서버 데이터로 캐시 교체 (임시 ID → 실제 ID)
   - UI 자동 업데이트
   ↓
7. 실패:
   - 캐시 롤백 (임시 포스트 제거)
   - 에러 메시지 표시
```

### 시나리오 3: 인증 실패 처리

```
1. API 요청 전송
   ↓
2. 서버에서 401 Unauthorized 응답
   ↓
3. Axios 응답 인터셉터 감지
   ↓
4. clearToken() 호출 (토큰 삭제)
   ↓
5. window.location.href = '/login' (자동 리다이렉트)
   ↓
6. 로그인 페이지 표시
```

## 캐싱 전략

### 캐시 무효화 (Invalidation) 패턴

```typescript
// 특정 키 무효화
mutate(['posts', 0, 10]);  // 1페이지 캐시만 무효화

// 패턴 매칭 무효화
mutate(
  (key) => typeof key === 'string' && key.includes('posts')
);  // 'posts'가 포함된 모든 캐시 무효화

// 전역 무효화
mutate(() => true);  // 모든 캐시 무효화 (비추천)
```

### 캐시 수명 관리

```typescript
// SWR 기본 캐싱 전략
{
  dedupingInterval: 2000,  // 2초 내 동일 요청은 캐시 사용
  focusThrottleInterval: 5000,  // 5초 내 포커스 재검증 무시
}
```

**동작 예시**:
```
t=0s:  요청 A 전송 → 캐시 저장
t=1s:  요청 A 다시 호출 → 캐시 반환 (네트워크 요청 안 함)
t=3s:  요청 A 다시 호출 → 캐시 반환 + 백그라운드 재검증
```

## 성능 최적화 팁

### 1. 적절한 캐시 키 설계

```typescript
// ❌ 나쁜 예: 너무 넓은 캐시 키
useSWR('posts', fetchPosts);

// ✅ 좋은 예: 매개변수별 독립 캐시
useSWR(['posts', page, size, sort], fetchPosts);
```

### 2. keepPreviousData 활용

```typescript
// 페이지 전환 시 이전 데이터 유지 (깜빡임 방지)
{
  keepPreviousData: true
}
```

**효과**:
- 2페이지로 이동 시 1페이지 데이터를 유지하며 2페이지 로딩
- 로딩 스피너 대신 이전 데이터 표시 (UX 개선)

### 3. 조건부 조회로 불필요한 요청 방지

```typescript
// ❌ 나쁜 예: 항상 조회
useSWR(['post', slug], () => api.posts.getBySlug(slug));

// ✅ 좋은 예: slug 있을 때만 조회
useSWR(slug ? ['post', slug] : null, () => api.posts.getBySlug(slug));
```

### 4. 프리페칭으로 체감 속도 개선

```typescript
// 마우스 호버 시 미리 데이터 로드
<Link onMouseEnter={() => prefetch(slug)}>
  {title}
</Link>
```

## 디버깅 팁

### SWR DevTools 활용

```bash
npm install @swr-devtools/react

# 개발 환경에서만 활성화
if (process.env.NODE_ENV === 'development') {
  <SWRDevTools />
}
```

### 로깅으로 데이터 흐름 추적

```typescript
// API 클라이언트 로깅
logger.debug('API 요청', { url, method, params });
logger.debug('API 응답', { status, data });
logger.error('API 에러', { status, error });

// SWR 로깅
console.log('SWR 캐시 키:', key);
console.log('SWR 데이터:', data);
console.log('SWR 에러:', error);
```

## 참고 자료

- [SWR 공식 문서](https://swr.vercel.app)
- [React Hook Form 문서](https://react-hook-form.com)
- [Zod 문서](https://zod.dev)
- [Axios 문서](https://axios-http.com)
