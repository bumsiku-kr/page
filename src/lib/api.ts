import axios, { AxiosRequestConfig } from 'axios';

// API 기본 URL
const API_BASE_URL = 'https://api.bumsiku.kr';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 응답 데이터 기본 구조
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * GET 요청 래퍼 함수
 * @param url 엔드포인트
 * @param config axios 요청 설정
 * @returns 응답 데이터
 */
export async function fetchData<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiResponse<null>;
      throw new Error(apiError.error?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    }
    throw error;
  }
}

/**
 * POST 요청 래퍼 함수
 * @param url 엔드포인트
 * @param data 요청 데이터
 * @param config axios 요청 설정
 * @returns 응답 데이터
 */
export async function postData<T, D = any>(
  url: string,
  data: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiResponse<null>;
      throw new Error(apiError.error?.message || '요청 처리 중 오류가 발생했습니다.');
    }
    throw error;
  }
}

/**
 * PUT 요청 래퍼 함수
 * @param url 엔드포인트
 * @param data 요청 데이터
 * @param config axios 요청 설정
 * @returns 응답 데이터
 */
export async function putData<T, D = any>(
  url: string,
  data: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiResponse<null>;
      throw new Error(apiError.error?.message || '요청 처리 중 오류가 발생했습니다.');
    }
    throw error;
  }
}

/**
 * DELETE 요청 래퍼 함수
 * @param url 엔드포인트
 * @param config axios 요청 설정
 * @returns 응답 데이터
 */
export async function deleteData<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiResponse<null>;
      throw new Error(apiError.error?.message || '요청 처리 중 오류가 발생했습니다.');
    }
    throw error;
  }
}

// src/lib/api/index.ts에서 내보낸 api 객체를 재내보냄
export { api } from './api/index';
