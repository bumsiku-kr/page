import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ErrorResponse, APIResponse } from '../../types';
import { getToken, clearToken } from './auth';
import { logger } from '@/lib/utils/logger';

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  POSTS: '/posts',
  ADMIN_POSTS: '/admin/posts',
  TAGS: '/tags',
  COMMENTS: '/comments',
  ADMIN_COMMENTS: '/admin/comments',
  ADMIN_IMAGES: '/admin/images',
  AI_SUMMARY: '/ai/summary',
  AI_SLUG: '/ai/slug',
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
        logger.debug('API 요청', {
          url: config.url,
          method: config.method,
          params: config.params,
        });
        return config;
      },
      error => {
        logger.error('API 요청 오류', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      response => {
        logger.debug('API 응답 성공', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      error => {
        logger.error('API 응답 오류', {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
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
      const response = await this.retryRequest<APIResponse<T>>(config);
      const payload = response?.data;

      // 타입 가드로 APIResponse 구조 검증
      if (this.isAPIResponse<T>(payload)) {
        return payload.data;
      }

      // Plain response (string, number 등 직접 반환)
      return payload as T;
    } catch (error) {
      return this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Type guard for APIResponse structure
   * Ensures type safety by checking response shape at runtime
   */
  private isAPIResponse<T>(response: unknown): response is APIResponse<T> {
    return (
      typeof response === 'object' &&
      response !== null &&
      'data' in response &&
      'success' in response
    );
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
        logger.warn(`API 호출 실패 (시도 ${attempt + 1}/${maxRetries})`, error);
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
