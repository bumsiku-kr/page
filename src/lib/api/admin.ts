import { LoginRequest, UploadImageResponse } from '../../types';
import { APIClient, API_ENDPOINTS } from './client';

export class ImagesService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async upload(file: File): Promise<UploadImageResponse> {
    try {
      console.log('이미지 업로드 요청:', { fileName: file.name, fileSize: file.size });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.client.request<UploadImageResponse>({
        url: API_ENDPOINTS.ADMIN_IMAGES,
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('이미지 업로드 응답:', response);
      return response;
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

  async login(data: LoginRequest): Promise<string> {
    try {
      console.log('로그인 요청');
      const response = await this.client.request<string>({
        url: API_ENDPOINTS.LOGIN,
        method: 'POST',
        data,
      });
      console.log('로그인 응답:', { success: true });
      return response;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  }
} 