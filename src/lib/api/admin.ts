import { LoginRequest, UploadImageResponse } from '../../types';
import { APIClient, API_ENDPOINTS } from './client';
import { setToken, getToken } from './auth';
import axios from 'axios';

export class ImagesService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async upload(file: File): Promise<UploadImageResponse> {
    try {
      console.log('이미지 업로드 요청:', { fileName: file.name, fileSize: file.size });

      const formData = new FormData();
      formData.append('file', file); // Changed from 'image' to 'file' per new API spec

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // Use admin-worker endpoint with JWT authentication
      const adminApiUrl = 'https://admin-worker.peter012677.workers.dev';
      const response = await axios.post<{ success: boolean; data: UploadImageResponse; error: null }>(
        `${adminApiUrl}${API_ENDPOINTS.ADMIN_IMAGES}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // axios will automatically set multipart/form-data with boundary
          },
        }
      );

      console.log('이미지 업로드 응답:', response.data);

      // Backend returns { success: true, data: { url, key }, error: null }
      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('이미지 업로드에 실패했습니다.');
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      throw error;
    }
  }
}

export class AuthService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async login(data: LoginRequest): Promise<{ token: string; expiresIn: number }> {
    try {
      console.log('로그인 요청');
      const response = await this.client.request<{ token: string; expiresIn: number }>({
        url: API_ENDPOINTS.LOGIN,
        method: 'POST',
        data,
      });
      console.log('로그인 응답:', { success: true });

      // Save JWT token to localStorage
      if (response.token) {
        setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  }
}
