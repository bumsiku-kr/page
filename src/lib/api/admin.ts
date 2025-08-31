import { LoginRequest, UploadImageResponse } from '../../types';
import { APIClient, API_ENDPOINTS } from './client';
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
      formData.append('image', file);

      // 직접 백엔드 서버로 요청
      const response = await axios.post<{ success: boolean; data: UploadImageResponse }>(
        'https://api.bumsiku.kr/admin/images',
        formData,
        {
          withCredentials: true, // 쿠키 전송을 위해 필요
          headers: {
            // 헤더를 설정하지 않아 axios가 자동으로 multipart/form-data와 boundary 설정
          },
        }
      );

      console.log('이미지 업로드 응답:', response.data);
      return response.data.data;
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
