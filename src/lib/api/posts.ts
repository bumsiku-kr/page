import { Post, GetPostsResponse, CreatePostRequest, UpdatePostRequest } from '../../types';
import { APIClient, API_ENDPOINTS } from './client';
import { logger } from '@/lib/utils/logger';

export class PostsService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async getList(
    page: number = 0,
    size: number = 5,
    tag?: string,
    sort: string = 'createdAt,desc'
  ): Promise<GetPostsResponse['data']> {
    try {
      logger.debug('게시물 목록 요청', { page, size, tag, sort });
      const response = await this.client.request<GetPostsResponse['data']>({
        url: API_ENDPOINTS.POSTS,
        method: 'GET',
        domain: 'public', // Public API 사용
        params: {
          page,
          size,
          sort,
          ...(tag && { tag }),
        },
      });
      logger.debug('게시물 목록 응답', response);
      return response;
    } catch (error) {
      logger.error('게시물 목록 조회 오류', error);
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
      logger.debug('게시물 상세 요청', { postId });
      const response = await this.client.request<Post>({
        url: `${API_ENDPOINTS.POSTS}/${postId}`,
        method: 'GET',
        domain: 'public', // Public API 사용
      });
      logger.debug('게시물 상세 응답', response);
      return response;
    } catch (error) {
      logger.error('게시물 상세 조회 오류', error);
      throw error;
    }
  }

  async getBySlug(slug: string): Promise<Post> {
    try {
      logger.debug('게시물 슬러그 요청', { slug });
      const response = await this.client.request<Post>({
        url: `${API_ENDPOINTS.POSTS}/${slug}`,
        method: 'GET',
        domain: 'public', // Public API 사용
      });
      logger.debug('게시물 슬러그 응답', response);
      return response;
    } catch (error) {
      logger.error('게시물 슬러그 조회 오류', error);
      throw error;
    }
  }

  async create(data: CreatePostRequest): Promise<Post> {
    try {
      logger.debug('게시물 생성 요청', data);
      const response = await this.client.request<Post>({
        url: API_ENDPOINTS.ADMIN_POSTS,
        method: 'POST',
        data,
      });
      logger.debug('게시물 생성 응답', response);
      return response;
    } catch (error) {
      logger.error('게시물 생성 오류', error);
      throw error;
    }
  }

  async update(postId: number, data: UpdatePostRequest): Promise<Post> {
    try {
      logger.debug('게시물 수정 요청', { postId, data });
      const response = await this.client.request<Post>({
        url: `${API_ENDPOINTS.ADMIN_POSTS}/${postId}`,
        method: 'PUT',
        data,
      });
      logger.debug('게시물 수정 응답', response);
      return response;
    } catch (error) {
      logger.error('게시물 수정 오류', error);
      throw error;
    }
  }

  async incrementViews(postId: number): Promise<void> {
    try {
      logger.debug('게시물 조회수 증가 요청', { postId });
      await this.client.request<void>({
        url: `${API_ENDPOINTS.POSTS}/${postId}/views`,
        method: 'PATCH',
        domain: 'public', // Public worker handles view tracking
      });
      logger.debug('게시물 조회수 증가 완료', { postId });
    } catch (error) {
      logger.error('게시물 조회수 증가 오류', error);
      // Silently fail - view tracking is not critical
    }
  }

  async delete(postId: number): Promise<string> {
    try {
      logger.debug('게시물 삭제 요청', { postId });
      const response = await this.client.request<string>({
        url: `${API_ENDPOINTS.ADMIN_POSTS}/${postId}`,
        method: 'DELETE',
      });
      logger.debug('게시물 삭제 응답', response);
      return response;
    } catch (error) {
      logger.error('게시물 삭제 오류', error);
      throw error;
    }
  }

  async getSitemap(): Promise<string[]> {
    try {
      logger.debug('사이트맵 요청');
      const response = await this.client.request<string[]>({
        url: '/sitemap',
        method: 'GET',
        domain: 'public', // Public API 사용
      });
      logger.debug('사이트맵 응답', response);
      return response;
    } catch (error) {
      logger.error('사이트맵 조회 오류', error);
      throw error;
    }
  }
}
