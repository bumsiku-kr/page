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
console.log('API URL:', API_URL); // 현재 API URL 로깅

// 디버깅을 위한 환경 변수 확인
console.log('환경 변수:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
});

// API 클라이언트 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 쿠키 기반 인증을 위해 필요
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃 설정
});

// 요청 인터셉터 추가
apiClient.interceptors.request.use(
  config => {
    console.log('API 요청:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      params: config.params,
      data: config.data
    });
    return config;
  },
  error => {
    console.error('API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
apiClient.interceptors.response.use(
  response => {
    console.log('API 응답 성공:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API 응답 오류:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// 응답 데이터 추출 헬퍼 함수
const handleResponse = <T>(response: AxiosResponse<any>) => {
  // API 응답 형식이 { success: boolean, data: T } 구조인 경우 내부 data 객체 반환
  const responseData = response.data;
  if (responseData && responseData.success === true && responseData.data) {
    console.log('응답 데이터에서 내부 data 객체 추출:', responseData.data);
    return responseData.data as T;
  }
  
  // 기존 구조는 그대로 반환
  return responseData as T;
};

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

// API 요청을 재시도하는 함수
async function retryApiCall<T>(apiCall: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      console.warn(`API 호출 실패 (시도 ${attempt + 1}/${maxRetries}):`, error);
      lastError = error;
      
      // 마지막 시도가 아니면 잠시 대기 후 재시도
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 지수 백오프
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // 모든 재시도가 실패하면 마지막 오류 throw
  throw lastError;
}

// 게시물 관련 API
export const postsApi = {
  // 게시물 목록 조회
  getPosts: async (page: number = 1, pageSize: number = 10, category?: string): Promise<GetPostsResponse> => {
    try {
      const params = { page, pageSize, ...(category && { category }) };
      console.log('API 요청 URL (getPosts):', `${API_URL}/posts`, params);
      
      // 재시도 메커니즘 적용 및 method:GET 명시
      const response = await retryApiCall(() => 
        apiClient.request<GetPostsResponse>({
          url: '/posts',
          method: 'GET',
          params: params
        })
      );
      
      return handleResponse(response);
    } catch (error) {
      console.error('API 오류 (getPosts):', error);
      // 오류 발생 시 기본값 반환
      return {
        posts: [],
        totalCount: 0,
        totalPages: 1,
        currentPage: page
      };
    }
  },

  // 게시물 상세 조회
  getPost: async (id: string): Promise<Post> => {
    try {
      console.log('API 요청 URL (getPost):', `${API_URL}/posts/${id}`);
      
      // 재시도 메커니즘 적용 및 method:GET 명시
      const response = await retryApiCall(() => 
        apiClient.request<Post>({
          url: `/posts/${id}`,
          method: 'GET'
        })
      );
      
      return handleResponse(response);
    } catch (error) {
      console.error('API 오류 (getPost):', error);
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
      console.log('API 요청 URL (getCategories):', `${API_URL}/categories`);
      
      // 재시도 메커니즘 적용 및 method:GET 명시
      const response = await retryApiCall(() => 
        apiClient.request<GetCategoriesResponse>({
          url: '/categories', 
          method: 'GET'
        })
      );
      
      return handleResponse(response);
    } catch (error) {
      console.error('API 오류 (getCategories):', error);
      // 오류 발생 시 기본값 반환
      return {
        categories: []
      };
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
      console.log('API 요청 URL (getComments):', `${API_URL}/comments/${postId}`);
      
      // method:GET 명시
      const response = await apiClient.request<Comment[]>({
        url: `/comments/${postId}`,
        method: 'GET'
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API 오류 (getComments):', error);
      // 오류 발생 시 빈 배열 반환
      return [];
    }
  },

  // 댓글 등록
  createComment: async (postId: string, commentData: CreateCommentRequest): Promise<Comment> => {
    try {
      // method:POST 명시
      const response = await apiClient.request<Comment>({
        url: `/comments/${postId}`,
        method: 'POST',
        data: commentData
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API 오류 (createComment):', error);
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  // 댓글 삭제 (관리자 전용)
  deleteComment: async (commentId: string): Promise<{ message: string }> => {
    try {
      // method:DELETE 명시
      const response = await apiClient.request<{ message: string }>({
        url: `/admin/comments/${commentId}`,
        method: 'DELETE'
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API 오류 (deleteComment):', error);
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },
};

// 인증 관련 API
export const authApi = {
  // 관리자 로그인
  login: async (credentials: LoginRequest): Promise<{ message: string }> => {
    try {
      // method:POST 명시
      const response = await apiClient.request<{ message: string }>({
        url: '/login',
        method: 'POST',
        data: credentials
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API 오류 (login):', error);
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  // 로그인 상태 확인 (추가 기능, 백엔드에 해당 API가 없으므로 간접적으로 확인)
  checkAuth: async (): Promise<boolean> => {
    try {
      // 관리자 전용 API를 호출하여 인증 상태 확인
      // 실제 데이터는 사용하지 않고 응답 코드만 확인
      // method:GET 명시
      await apiClient.request({
        url: '/admin/posts',
        method: 'GET',
        params: { page: 1, pageSize: 1 }
      });
      
      return true; // 인증된 상태
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('API 오류 (checkAuth):', error);
      
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