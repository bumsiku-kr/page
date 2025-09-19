import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ErrorResponse, APIResponse } from '../../types';
import { getToken, clearToken } from '@/lib/auth';

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  POSTS: '/posts',
  ADMIN_POSTS: '/admin/posts',
  TAGS: '/tags',
  COMMENTS: '/comments',
  ADMIN_COMMENTS: '/admin/comments',
  ADMIN_IMAGES: '/admin/images',
  AI_SUMMARY: '/ai/summary',
  LOGIN: '/login',
} as const;

// API 클라이언트 설정
export class APIClient {
  private client: AxiosInstance;
  private static instance: APIClient;

  private constructor() {
    const API_URL = 'https://api.bumsiku.kr';

    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000,
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
        const token = getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
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
        if (error?.response?.status === 401) {
          clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // 공통 API 호출 함수
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.retryRequest<any>(config);
      const payload = response?.data;
      // 표준 래핑 응답(APIResponse<T>) 우선 처리
      if (payload && typeof payload === 'object' && 'data' in payload) {
        return payload.data as T;
      }
      // 비래핑(plain) 응답도 허용 (예: string 또는 { summary: string })
      return payload as T;
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
}

// SWR 호환 fetcher
export const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};
