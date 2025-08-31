import { Post, GetPostsResponse, CreatePostRequest, UpdatePostRequest } from '../../types';
import { APIClient, API_ENDPOINTS } from './client';

export class PostsService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async getList(
    page: number = 0,
    size: number = 5,
    category?: number,
    sort: string = 'createdAt,desc'
  ): Promise<GetPostsResponse['data']> {
    try {
      console.log('게시물 목록 요청:', { page, size, category, sort });
      const response = await this.client.request<GetPostsResponse['data']>({
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
  }

  async getOne(postId: number): Promise<Post> {
    try {
      console.log('게시물 상세 요청:', { postId });
      const response = await this.client.request<Post>({
        url: `${API_ENDPOINTS.POSTS}/${postId}`,
        method: 'GET',
      });
      console.log('게시물 상세 응답:', response);
      return response;
    } catch (error) {
      console.error('게시물 상세 조회 오류:', error);
      throw error;
    }
  }

  async create(data: CreatePostRequest): Promise<Post> {
    try {
      console.log('게시물 생성 요청:', data);
      const response = await this.client.request<Post>({
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
  }

  async update(postId: number, data: UpdatePostRequest): Promise<Post> {
    try {
      console.log('게시물 수정 요청:', { postId, data });
      const response = await this.client.request<Post>({
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
  }

  async delete(postId: number): Promise<string> {
    try {
      console.log('게시물 삭제 요청:', { postId });
      const response = await this.client.request<string>({
        url: `${API_ENDPOINTS.ADMIN_POSTS}/${postId}`,
        method: 'DELETE',
      });
      console.log('게시물 삭제 응답:', response);
      return response;
    } catch (error) {
      console.error('게시물 삭제 오류:', error);
      throw error;
    }
  }
}
