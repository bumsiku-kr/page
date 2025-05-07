import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../types';
import { APIClient, API_ENDPOINTS } from './client';

export class CategoriesService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async getList(): Promise<Category[]> {
    try {
      console.log('카테고리 목록 요청');
      const response = await this.client.request<Category[]>({
        url: API_ENDPOINTS.CATEGORIES,
        method: 'GET',
      });
      console.log('카테고리 목록 응답:', response);
      return response;
    } catch (error) {
      console.error('카테고리 목록 조회 오류:', error);
      return [];
    }
  }

  async create(data: CreateCategoryRequest): Promise<Category> {
    try {
      console.log('카테고리 생성 요청:', data);
      const response = await this.client.request<Category>({
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
  }

  async update(categoryId: number, data: UpdateCategoryRequest): Promise<Category> {
    try {
      console.log('카테고리 수정 요청:', { categoryId, data });
      const response = await this.client.request<Category>({
        url: `${API_ENDPOINTS.ADMIN_CATEGORIES}/${categoryId}`,
        method: 'PUT',
        data,
      });
      console.log('카테고리 수정 응답:', response);
      return response;
    } catch (error) {
      console.error('카테고리 수정 오류:', error);
      throw error;
    }
  }

  async delete(categoryId: number): Promise<string> {
    try {
      console.log('카테고리 삭제 요청:', { categoryId });
      const response = await this.client.request<string>({
        url: `${API_ENDPOINTS.ADMIN_CATEGORIES}/${categoryId}`,
        method: 'DELETE',
      });
      console.log('카테고리 삭제 응답:', response);
      return response;
    } catch (error) {
      console.error('카테고리 삭제 오류:', error);
      throw error;
    }
  }
} 