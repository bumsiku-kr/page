import { Tag } from '../../types';
import { APIClient, API_ENDPOINTS } from './client';

export class TagsService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async getList(): Promise<Tag[]> {
    try {
      console.log('태그 목록 요청');
      const response = await this.client.request<Tag[]>({
        url: API_ENDPOINTS.TAGS,
        method: 'GET',
      });
      console.log('태그 목록 응답:', response);
      return response;
    } catch (error) {
      console.error('태그 목록 조회 오류:', error);
      return [];
    }
  }
}

