import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  Post,
  Category,
  Comment,
  ErrorResponse,
  GetPostsResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCategoryRequest,
  CreateCategoryRequest,
  LoginRequest,
  APIResponse,
  UploadImageResponse,
} from '../types';

// API 엔드포인트 상수
const API_ENDPOINTS = {
  POSTS: '/posts',
  ADMIN_POSTS: '/admin/posts',
  CATEGORIES: '/categories',
  ADMIN_CATEGORIES: '/admin/categories',
  COMMENTS: '/comments',
  ADMIN_COMMENTS: '/admin/comments',
  ADMIN_IMAGES: '/admin/images',
  LOGIN: '/login',
} as const;

// API 클라이언트 설정
class APIClient {
  private client: AxiosInstance;
  private static instance: APIClient;

  private constructor() {
    const API_URL = 'https://api.bumsiku.kr'; // 직접 API 서버 호출

    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  private setupInterceptors(): void {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      config => {
        console.log('API 요청:', {
          url: config.url,
          method: config.method,
          baseURL: config.baseURL,
          params: config.params,
          data: config.data,
        });
        return config;
      },
      error => {
        console.error('API 요청 오류:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      response => {
        console.log('API 응답 성공:', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      error => {
        console.error('API 응답 오류:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  // 공통 API 호출 함수
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.retryRequest<APIResponse<T>>(config);
      return response.data.data;
    } catch (error) {
      return this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  // 재시도 로직을 포함한 요청 함수
  private async retryRequest<T>(
    config: AxiosRequestConfig,
    maxRetries: number = 3
  ): Promise<AxiosResponse<T>> {
    let lastError: Error | AxiosError = new Error();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.client.request<T>(config);
      } catch (error) {
        console.warn(`API 호출 실패 (시도 ${attempt + 1}/${maxRetries}):`, error);
        lastError = error as Error | AxiosError;

        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  // 에러 처리 함수
  private handleError(error: AxiosError<ErrorResponse>): never {
    if (error.response) {
      const errorMessage = error.response.data.error?.message || '알 수 없는 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }

    if (error.request) {
      throw new Error('서버로부터 응답을 받지 못했습니다.');
    }

    throw new Error('요청 중 오류가 발생했습니다.');
  }

  // Posts API
  public readonly posts = {
    getList: async (
      page: number = 0,
      size: number = 10,
      category?: number,
      sort: string = 'createdAt,desc'
    ): Promise<GetPostsResponse['data']> => {
      try {
        console.log('게시물 목록 요청:', { page, size, category, sort });
        const response = await this.request<GetPostsResponse['data']>({
          url: API_ENDPOINTS.POSTS,
          method: 'GET',
          params: {
            page,
            size,
            sort,
            ...(category && { category }),
          },
        });
        console.log('게시물 목록 응답:', response);
        return response;
      } catch (error) {
        console.error('게시물 목록 조회 오류:', error);
        return {
          content: [],
          totalElements: 0,
          pageNumber: page,
          pageSize: size,
        };
      }
    },

    getOne: async (postId: number) => {
      try {
        console.log('게시물 상세 요청:', { postId });
        const response = await this.request<Post>({
          url: `${API_ENDPOINTS.POSTS}/${postId}`,
          method: 'GET',
        });
        console.log('게시물 상세 응답:', response);
        return response;
      } catch (error) {
        console.error('게시물 상세 조회 오류:', error);
        throw error;
      }
    },

    create: async (data: CreatePostRequest) => {
      try {
        console.log('게시물 생성 요청:', data);
        const response = await this.request<Post>({
          url: API_ENDPOINTS.ADMIN_POSTS,
          method: 'POST',
          data,
        });
        console.log('게시물 생성 응답:', response);
        return response;
      } catch (error) {
        console.error('게시물 생성 오류:', error);
        throw error;
      }
    },

    update: async (postId: number, data: UpdatePostRequest) => {
      try {
        console.log('게시물 수정 요청:', { postId, data });
        const response = await this.request<Post>({
          url: `${API_ENDPOINTS.ADMIN_POSTS}/${postId}`,
          method: 'PUT',
          data,
        });
        console.log('게시물 수정 응답:', response);
        return response;
      } catch (error) {
        console.error('게시물 수정 오류:', error);
        throw error;
      }
    },

    delete: async (postId: number) => {
      try {
        console.log('게시물 삭제 요청:', { postId });
        const response = await this.request<string>({
          url: `${API_ENDPOINTS.ADMIN_POSTS}/${postId}`,
          method: 'DELETE',
        });
        console.log('게시물 삭제 응답:', response);
        return response;
      } catch (error) {
        console.error('게시물 삭제 오류:', error);
        throw error;
      }
    },
  };

  // Categories API
  public readonly categories = {
    getList: async (): Promise<Category[]> => {
      try {
        console.log('카테고리 목록 요청');
        const response = await this.request<Category[]>({
          url: API_ENDPOINTS.CATEGORIES,
          method: 'GET',
        });
        console.log('카테고리 목록 응답:', response);
        return response;
      } catch (error) {
        console.error('카테고리 목록 조회 오류:', error);
        return [];
      }
    },

    create: async (data: CreateCategoryRequest) => {
      try {
        console.log('카테고리 생성 요청:', data);
        const response = await this.request<Category>({
          url: API_ENDPOINTS.ADMIN_CATEGORIES,
          method: 'POST',
          data,
        });
        console.log('카테고리 생성 응답:', response);
        return response;
      } catch (error) {
        console.error('카테고리 생성 오류:', error);
        throw error;
      }
    },

    update: async (id: number, data: UpdateCategoryRequest) => {
      try {
        console.log('카테고리 수정 요청:', { id, data });
        const response = await this.request<Category>({
          url: `${API_ENDPOINTS.ADMIN_CATEGORIES}/${id}`,
          method: 'PUT',
          data,
        });
        console.log('카테고리 수정 응답:', response);
        return response;
      } catch (error) {
        console.error('카테고리 수정 오류:', error);
        throw error;
      }
    },
  };

  // Comments API
  public readonly comments = {
    getList: async (postId: number): Promise<Comment[]> => {
      try {
        console.log('댓글 목록 요청:', { postId });
        const response = await this.request<Comment[]>({
          url: `${API_ENDPOINTS.COMMENTS}/${postId}`,
          method: 'GET',
        });
        console.log('댓글 목록 응답:', response);
        return response;
      } catch (error) {
        console.error('댓글 목록 조회 오류:', error);
        return [];
      }
    },

    create: async (postId: number, data: CreateCommentRequest): Promise<Comment> => {
      try {
        console.log('댓글 생성 요청:', { postId, data });
        const response = await this.request<Comment>({
          url: `${API_ENDPOINTS.COMMENTS}/${postId}`,
          method: 'POST',
          data,
        });
        console.log('댓글 생성 응답:', response);
        return response;
      } catch (error) {
        console.error('댓글 생성 오류:', error);
        throw error;
      }
    },

    delete: async (commentId: string) => {
      try {
        console.log('댓글 삭제 요청:', { commentId });
        const response = await this.request<string>({
          url: `${API_ENDPOINTS.ADMIN_COMMENTS}/${commentId}`,
          method: 'DELETE',
        });
        console.log('댓글 삭제 응답:', response);
        return response;
      } catch (error) {
        console.error('댓글 삭제 오류:', error);
        throw error;
      }
    },
  };

  // Images API
  public readonly images = {
    upload: async (file: File): Promise<UploadImageResponse> => {
      try {
        console.log('이미지 업로드 요청:', { fileName: file.name, fileSize: file.size });
        const formData = new FormData();
        formData.append('image', file);

        const response = await this.request<UploadImageResponse>({
          url: API_ENDPOINTS.ADMIN_IMAGES,
          method: 'POST',
          data: formData,
        });
        console.log('이미지 업로드 응답:', response);
        return response;
      } catch (error) {
        console.error('이미지 업로드 오류:', error);
        throw error;
      }
    },
  };

  // Auth API
  public readonly auth = {
    login: async (credentials: LoginRequest) => {
      try {
        console.log('로그인 요청'); // 보안을 위해 자격증명은 로깅하지 않음
        const response = await this.request<string>({
          url: API_ENDPOINTS.LOGIN,
          method: 'POST',
          data: credentials,
        });
        console.log('로그인 응답:', { success: !!response });
        return response;
      } catch (error) {
        console.error('로그인 오류:', error);
        throw error;
      }
    },

    checkAuth: async (): Promise<boolean> => {
      try {
        console.log('인증 상태 확인 요청');
        await this.client.request({
          url: API_ENDPOINTS.ADMIN_POSTS,
          method: 'GET',
          params: { page: 0, size: 1 },
        });
        console.log('인증 상태 확인 응답: 인증됨');
        return true;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          console.log('인증 상태 확인 응답: 인증되지 않음');
          return false;
        }
        console.error('인증 상태 확인 오류:', error);
        throw error;
      }
    },
  };
}

// API 클라이언트 인스턴스 생성 및 export
export const api = APIClient.getInstance();
