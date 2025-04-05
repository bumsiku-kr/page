import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  Post,
  Category,
  Comment,
  ErrorResponse,
  GetPostsResponse,
  GetCategoriesResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCategoryRequest,
  LoginRequest,
} from '../types';

// 기본 API URL 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// API 클라이언트 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 쿠키 기반 인증을 위해 필요
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 데이터 추출 헬퍼 함수
const handleResponse = <T>(response: AxiosResponse<T>) => response.data;

// 에러 처리 헬퍼 함수
const handleError = (error: AxiosError<ErrorResponse>) => {
  if (error.response) {
    // 서버에서 응답이 왔지만 2xx 상태 코드가 아닌 경우
    const errorMessage = error.response.data.error?.message || '알 수 없는 오류가 발생했습니다.';
    throw new Error(errorMessage);
  }
  
  if (error.request) {
    // 요청은 성공했지만 응답을 받지 못한 경우
    throw new Error('서버로부터 응답을 받지 못했습니다.');
  }
  
  // 요청 설정 중 오류가 발생한 경우
  throw new Error('요청 중 오류가 발생했습니다.');
};

// 게시물 관련 API
export const postsApi = {
  // 게시물 목록 조회
  getPosts: async (page: number = 1, pageSize: number = 10, category?: string): Promise<GetPostsResponse> => {
    try {
      const params = { page, pageSize, ...(category && { category }) };
      const response = await apiClient.get<GetPostsResponse>('/posts', { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  // 게시물 상세 조회
  getPost: async (id: string): Promise<Post> => {
    try {
      const response = await apiClient.get<Post>(`/posts/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  // 게시물 작성 (관리자 전용)
  createPost: async (postData: CreatePostRequest): Promise<Post> => {
    try {
      const response = await apiClient.post<Post>('/admin/posts', postData);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  // 게시물 수정 (관리자 전용)
  updatePost: async (id: string, postData: UpdatePostRequest): Promise<Post> => {
    try {
      const response = await apiClient.put<Post>(`/admin/posts/${id}`, postData);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  // 게시물 삭제 (관리자 전용)
  deletePost: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await apiClient.delete<{ message: string }>(`/admin/posts/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },
};

// 카테고리 관련 API
export const categoriesApi = {
  // 카테고리 목록 조회
  getCategories: async (): Promise<GetCategoriesResponse> => {
    try {
      const response = await apiClient.get<GetCategoriesResponse>('/categories');
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  // 카테고리 추가/수정 (관리자 전용)
  updateCategory: async (categoryData: UpdateCategoryRequest): Promise<Category> => {
    try {
      const response = await apiClient.put<Category>('/admin/categories', categoryData);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },
};

// 댓글 관련 API
export const commentsApi = {
  // 게시물별 댓글 조회
  getComments: async (postId: string): Promise<Comment[]> => {
    try {
      const response = await apiClient.get<Comment[]>(`/comments/${postId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  // 댓글 등록
  createComment: async (postId: string, commentData: CreateCommentRequest): Promise<Comment> => {
    try {
      const response = await apiClient.post<Comment>(`/comments/${postId}`, commentData);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  // 댓글 삭제 (관리자 전용)
  deleteComment: async (commentId: string): Promise<{ message: string }> => {
    try {
      const response = await apiClient.delete<{ message: string }>(`/admin/comments/${commentId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },
};

// 인증 관련 API
export const authApi = {
  // 관리자 로그인
  login: async (credentials: LoginRequest): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post<{ message: string }>('/login', credentials);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  // 로그인 상태 확인 (추가 기능, 백엔드에 해당 API가 없으므로 간접적으로 확인)
  checkAuth: async (): Promise<boolean> => {
    try {
      // 관리자 전용 API를 호출하여 인증 상태 확인
      // 실제 데이터는 사용하지 않고 응답 코드만 확인
      await apiClient.get('/admin/posts?page=1&pageSize=1');
      return true; // 인증된 상태
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        return false; // 인증되지 않은 상태
      }
      // 기타 오류는 정상적으로 처리
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },
};

// API 유틸리티 모음
export const api = {
  posts: postsApi,
  categories: categoriesApi,
  comments: commentsApi,
  auth: authApi,
};

export default api; 