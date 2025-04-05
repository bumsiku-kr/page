# 개인 기술 블로그 & 포트폴리오 웹사이트

Next.js와 TypeScript로 구현된 개인 기술 블로그 및 포트폴리오 웹사이트입니다.

## 🚀 기능

- **반응형 디자인**: 모바일 및 데스크톱에 최적화된 UI
- **블로그 페이지**: 기술 게시글 목록 및 상세 페이지
- **포트폴리오**: 프로젝트 작업물 전시
- **할 일 관리 컴포넌트**: 간단한 할 일 관리 기능

## 📚 기술 스택

- [Next.js](https://nextjs.org/) - React 기반 프레임워크
- [TypeScript](https://www.typescriptlang.org/) - 정적 타입 시스템
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 기반 CSS 프레임워크

## 🛠️ 시작하기

### 필수 조건

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치

1. 저장소 클론

```bash
git clone https://github.com/yourusername/my-blog-portfolio.git
cd my-blog-portfolio
```

2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

3. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

4. http://localhost:3000 으로 접속하여 웹사이트 확인

## 📂 프로젝트 구조

```
/
├── app/                  # Next.js 앱 디렉토리
│   ├── components/       # 재사용 가능한 컴포넌트
│   ├── blog/             # 블로그 관련 페이지
│   ├── portfolio/        # 포트폴리오 관련 페이지
│   ├── posts/            # 개별 블로그 포스트 페이지
│   ├── lib/              # 유틸리티 및 공통 함수
│   ├── page.tsx          # 홈페이지
│   └── layout.tsx        # 전체 레이아웃
└── public/               # 정적 파일 (이미지, 아이콘 등)
    ├── icons/            # 기술 스택 아이콘
    └── projects/         # 프로젝트 썸네일 이미지
```

## 📱 페이지

- **홈**: 소개 및 주요 기술 스택 표시
- **블로그**: 기술 관련 게시글 목록 및 카테고리 필터
- **포트폴리오**: 주요 프로젝트 소개 및 링크
- **블로그 상세**: Markdown 형식의 게시글 내용과 다음/이전 글 이동 기능

## 🔜 향후 계획

- 다크 모드 지원
- 댓글 시스템 추가
- 블로그 검색 기능
- SEO 최적화

## 🤝 기여하기

이슈와 풀 리퀘스트는 언제나 환영합니다!

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 제공됩니다.
