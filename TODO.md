# 블로그 백엔드 연결 TODO 리스트

## 1. API 클라이언트 구현

- [x] `app/lib/api.ts` 파일 생성하여 API 클라이언트 유틸리티 구현
  - Axios 또는 fetch API를 사용하여 백엔드 API 요청 함수 작성
  - 기본 URL 설정 및 오류 처리 로직 구현
  - 응답 데이터 타입 정의

## 2. 데이터 타입 정의

- [x] `app/types/index.ts` 파일에 백엔드 API 응답과 일치하는 타입 정의
  - `Post`, `Category`, `Comment` 등의 타입 정의
  - API 요청/응답 관련 인터페이스 정의

## 3. API 연동 기능 구현

### 블로그 게시물 관련

- [ ] 게시물 목록 조회 기능 (`GET /posts`)
  - 페이지네이션 처리
  - 카테고리별 필터링 구현
- [ ] 게시물 상세 조회 기능 (`GET /posts/{id}`)
- [ ] 게시물 작성 기능 (`POST /admin/posts`)
- [ ] 게시물 수정 기능 (`PUT /admin/posts/{id}`)
- [ ] 게시물 삭제 기능 (`DELETE /admin/posts/{id}`)

### 카테고리 관련

- [ ] 카테고리 목록 조회 기능 (`GET /categories`)
- [ ] 카테고리 추가/수정 기능 (`PUT /admin/categories`)

### 댓글 관련

- [ ] 게시물별 댓글 목록 조회 기능 (`GET /comments/{id}`)
- [ ] 댓글 등록 기능 (`POST /comments/{postId}`)
- [ ] 댓글 삭제 기능 (`DELETE /admin/comments/{commentId}`)

### 인증 관련

- [ ] 관리자 로그인 기능 (`POST /login`)
- [ ] 로그인 상태 관리 및 세션 유지
- [ ] 인증된 상태에 따른 UI 조건부 렌더링

## 4. 컴포넌트 및 페이지 수정

- [ ] `app/blog/page.tsx` 수정
  - 백엔드 API에서 게시물 목록 조회 및 표시
  - 페이지네이션 UI 구현
  - 카테고리 필터링 기능 연동
- [ ] `app/posts/[postId]/page.tsx` 수정
  - 게시물 상세 정보 조회 및 표시
  - 댓글 목록 표시 및 댓글 작성 폼 구현
- [ ] 관리자 페이지 구현
  - `app/admin/page.tsx` - 관리자 로그인 페이지
  - `app/admin/posts/page.tsx` - 게시물 관리 페이지
  - `app/admin/posts/[id]/edit/page.tsx` - 게시물 수정 페이지
  - `app/admin/posts/new/page.tsx` - 게시물 작성 페이지
  - `app/admin/categories/page.tsx` - 카테고리 관리 페이지

## 5. 환경 설정

- [x] `.env.local` 파일 생성 및 백엔드 API URL 설정
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8080
  ```
- [ ] 개발 환경과 프로덕션 환경의 API URL 분리 설정

## 6. 테스트 및 디버깅

- [ ] API 통신 테스트 및 디버깅
- [ ] 오류 처리 및 사용자 피드백 UI 구현
- [ ] 로딩 상태 표시 UI 구현 