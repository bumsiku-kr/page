// 게시물 관련 타입
export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  summary: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  views?: number;
  canonicalPath?: string;
}

export interface PostSummary {
  id: number;
  slug: string;
  title: string;
  summary: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  views?: number;
}

// 태그 관련 타입
export interface Tag {
  id: number;
  name: string;
  createdAt: string;
  postCount: number;
}

// 댓글 관련 타입
export interface Comment {
  id: string; // UUID format (changed from number for new backend)
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
  /** @maxLength 100 @minLength 1 */
  slug: string;
  /** @maxLength 10000 @minLength 1 */
  content: string;
  /** @maxLength 200 @minLength 1 */
  summary: string;
  tags: string[];
  state: 'draft' | 'published'; // Required by new backend
}

export interface UpdatePostRequest {
  /** @maxLength 100 @minLength 1 */
  title: string; // Required by new backend
  /** @maxLength 100 @minLength 1 */
  slug: string;
  /** @maxLength 10000 @minLength 1 */
  content: string; // Required by new backend
  /** @maxLength 200 @minLength 1 */
  summary?: string;
  tags?: string[];
  state: 'draft' | 'published'; // Required by new backend
}

export interface CreateCommentRequest {
  author: string;
  content: string;
}

// 카테고리 관련 요청 타입은 제거되었습니다. 태그는 게시물 편집으로 관리합니다.

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
export type GetTagsResponse = APIResponse<Tag[]>;

// 이미지 업로드 관련 타입
export interface UploadImageResponse {
  url: string;
  key: string; // R2 storage key (new backend)
}

// 정렬 관련 타입
export type SortOption = 'createdAt,desc' | 'createdAt,asc' | 'views,desc' | 'views,asc';

export interface SortOptionInfo {
  value: SortOption;
  label: string;
  description: string;
}
