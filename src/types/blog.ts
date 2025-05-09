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
  createdAt: string;
  updatedAt: string;
}

// 게시글 상세 정보 타입
export interface Post {
  id: number;
  title: string;
  content: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

// 댓글 타입
export interface Comment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
  postId?: number;
}

// 카테고리 타입
export interface Category {
  id: number;
  name: string;
  order: number;
  createdAt: string;
  postCount: number;
}

// 게시글 생성 요청 타입
export interface CreatePostRequest {
  title: string;
  content: string;
  summary: string;
  category: number;
}

// 게시글 수정 요청 타입
export interface UpdatePostRequest {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
}

// 댓글 작성 요청 타입
export interface CommentRequest {
  content: string;
  author: string;
}

// 카테고리 생성 및 수정 요청 타입
export interface CategoryRequest {
  name: string;
  orderNum: number;
} 