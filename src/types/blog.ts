// 게시글 목록 응답 타입
export interface PostListResponse {
  content: PostSummary[];
  totalElements: number;
  pageNumber: number;
  pageSize: number;
}

// 게시글 요약 정보 타입
export interface PostSummary {
  id: number;
  title: string;
  summary: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// 게시글 상세 정보 타입
export interface Post {
  id: number;
  title: string;
  content: string;
  summary: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// 댓글 타입
export interface Comment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
  postId?: number;
}

// 태그 타입
export interface Tag {
  id: number;
  name: string;
  createdAt: string;
  postCount: number;
}

// 게시글 생성 요청 타입
export interface CreatePostRequest {
  title: string;
  content: string;
  summary: string;
  tags: string[];
}

// 게시글 수정 요청 타입
export interface UpdatePostRequest {
  title?: string;
  content?: string;
  summary?: string;
  tags?: string[];
}

// 댓글 작성 요청 타입
export interface CommentRequest {
  content: string;
  author: string;
}

// 태그는 별도 생성/수정 요청 타입이 없습니다. 게시물 수정에서 관리합니다.
