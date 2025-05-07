// 게시물 관련 타입
export interface Post {
  id: number;
  title: string;
  content: string;
  summary: string;
  category: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostSummary {
  id: number;
  title: string;
  summary: string;
  category: number;
  createdAt: string;
  updatedAt: string;
}

// 카테고리 관련 타입
export interface Category {
  id: number;
  name: string;
  order: number;
  createdAt: string;
  postCount: number;
}

// 댓글 관련 타입
export interface Comment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

// API 에러 관련 타입
export interface ErrorInfo {
  code: number;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  error: ErrorInfo;
}

// API 요청 관련 타입
export interface CreatePostRequest {
  /** @maxLength 100 @minLength 1 */
  title: string;
  /** @maxLength 10000 @minLength 1 */
  content: string;
  /** @maxLength 200 @minLength 1 */
  summary: string;
  category: number;
}

export interface UpdatePostRequest {
  /** @maxLength 100 @minLength 1 */
  title?: string;
  /** @maxLength 10000 @minLength 1 */
  content?: string;
  /** @maxLength 200 @minLength 1 */
  summary?: string;
  category?: number;
}

export interface CreateCommentRequest {
  author: string;
  content: string;
}

export interface UpdateCategoryRequest {
  /** @minLength 1 */
  name: string;
  orderNum: number;
}

export interface CreateCategoryRequest {
  /** @minLength 1 */
  name: string;
  orderNum: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// API 응답 관련 타입
export interface PostListResponse {
  content: PostSummary[];
  totalElements: number;
  pageNumber: number;
  pageSize: number;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: ErrorInfo;
}

export type GetPostsResponse = APIResponse<PostListResponse>;
export type GetCategoriesResponse = APIResponse<Category[]>;

// 이미지 업로드 관련 타입
export interface UploadImageResponse {
  url: string;
  size: number; // API Spec 에서는 int64지만, JavaScript 에서는 number 로 충분
} 