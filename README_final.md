# ��️ Personal Dev Blog

개인 개발자 웹사이트로, 기술 블로그 중심의 SSR 기반 웹 애플리케이션입니다.  
기술적으로는 **Next.js**, **React.js**, **TypeScript**를 기반으로 하며, 개발자 브랜딩을 위한 깔끔하고 우아한 UI를 목표로 합니다.

---

## 📌 프로젝트 목적

- 기술 블로그: 개발자로서의 지식 공유 및 학습 아카이빙
- 반응형 웹 디자인: 데스크탑, 태블릿, 모바일 모두에서 최적화된 UX 제공
- SEO 최적화 및 SSR 지원: 검색 엔진 노출과 성능 향상

---

## ⚙️ 기술 스택

| 영역         | 기술                                                                 |
|--------------|----------------------------------------------------------------------|
| 프레임워크   | [Next.js](https://nextjs.org/) – React 기반의 SSR 프레임워크        |
| 언어         | TypeScript                                                           |
| 프론트엔드   | React.js, CSS Modules / Styled Components / Tailwind (선택 사항)     |
| 백엔드 API   | Next.js API Routes, RESTful 설계                                     |
| 인증 방식    | 세션 기반 인증 (관리자 전용 기능 보호)                               |
| 데이터베이스 | DynamoDB (게시글, 댓글 저장)                                         |
| 배포         | Vercel 또는 Oracle Cloud Infrastructure (OCI)                        |

---

## 📁 주요 기능

- 블로그 게시글 목록 및 상세 페이지 제공 (날짜, 제목, 요약, 태그 포함)
- 카테고리 기반 사이드바 필터링
- 관리자 페이지 (`/admin`)에서 게시글 작성 및 수정
- 히어로 섹션: 프로필 이미지 + 간단한 자기소개
- SEO 및 OpenGraph 지원

---

## 🔐 API 개요

### 인증
- `POST /login`: 관리자 로그인

### 게시글
- `GET /posts`: 전체 포스트 목록 조회 (카테고리, 페이지네이션 지원)
- `GET /posts/:id`: 게시글 상세 조회
- `POST /admin/posts`: 새로운 포스트 작성
- `PUT /admin/posts/:id`: 기존 포스트 수정
- `DELETE /admin/posts/:id`: 포스트 삭제

### 댓글
- `GET /comments/:postId`: 댓글 목록 조회
- `POST /comments/:postId`: 댓글 작성
- `DELETE /admin/comments/:commentId`: 댓글 삭제

---

## 🔐 인증 및 보안

- `/admin/*` 경로는 세션 기반 인증이 필요합니다.
- 인증 실패 시 `401 Unauthorized` 응답을 반환하며, 서버와 클라이언트 모두 보호됩니다.

환경 변수 예시:
```env
SESSION_SECRET=your-secret
ADMIN_ID=admin
ADMIN_PW=password
```

---

## 📦 설치 및 실행

```bash
# 1. 프로젝트 클론
git clone https://github.com/your-username/your-project.git
cd your-project

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 확인
http://localhost:3000
```

---

## 📚 라우팅 요약

| 경로                  | 설명                             | 접근 방식     |
|-----------------------|----------------------------------|---------------|
| `/`                   | 메인 홈                          | 공개          |
| `/blog`               | 블로그 게시글 목록              | 공개          |
| `/posts/[postId]`     | 게시글 상세 페이지              | 공개          |
| `/admin`              | 관리자 페이지                   | 인증 필요     |

---

## 📁 프로젝트 구조 예시

```
.
├── app/
│   ├── page.tsx             # 홈
│   ├── blog/                # 블로그 관련 페이지
│   ├── posts/               # 블로그 포스트 상세 페이지
│   ├── admin/               # 관리자 대시보드
│   ├── api/                 # API 라우트
│   │   ├── login/           # 로그인 API
│   │   └── posts/           # 포스트 CRUD API
│   │
│   ├── components/          # 공통 UI 컴포넌트
│   ├── lib/                 # 유틸 및 인증 관련 함수
│   └── layout.tsx           # 공통 레이아웃
│
├── public/                  # 정적 파일
└── .env                     # 환경 변수
```

