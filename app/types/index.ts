// 게시물 관련 타입
export interface Post {
  postId: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// 카테고리 관련 타입
export interface Category {
  category: string;
  order: number;
  createdAt: string;
}

// 댓글 관련 타입
export interface Comment {
  commentId: string;
  postId: string;
  content: string;
  nickname: string;
  createdAt: string;
}

// API 에러 관련 타입
export interface APIError {
  code: string;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  error: APIError;
}

// API 요청 관련 타입
export interface CreatePostRequest {
  title: string;
  content: string;
  summary: string;
  category: string;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  summary: string;
  category: string;
}

export interface CreateCommentRequest {
  content: string;
  nickname: string;
}

export interface UpdateCategoryRequest {
  category: string;
  order: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// API 응답 관련 타입
export interface GetPostsResponse {
  posts: Post[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface GetCategoriesResponse {
  categories: Category[];
} 