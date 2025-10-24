import { Comment, CreateCommentRequest } from '../../types';
import { APIClient } from './client';

export class CommentsService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async getByPostId(postId: number): Promise<Comment[]> {
    try {
      console.log('댓글 목록 요청:', { postId });
      const response = await this.client.request<Comment[]>({
        url: `/comments/${postId}`,
        method: 'GET',
        domain: 'public', // Public API 사용 (읽기)
      });
      console.log('댓글 목록 응답:', response);
      return response;
    } catch (error) {
      console.error('댓글 목록 조회 오류:', error);
      return [];
    }
  }

  async create(postId: number, data: CreateCommentRequest): Promise<Comment> {
    try {
      console.log('댓글 생성 요청:', { postId, data });
      const response = await this.client.request<Comment>({
        url: `/comments/${postId}`,
        method: 'POST',
        domain: 'public', // Public API 사용 (익명 댓글 작성 가능)
        data,
      });
      console.log('댓글 생성 응답:', response);
      return response;
    } catch (error) {
      console.error('댓글 생성 오류:', error);
      throw error;
    }
  }

  async delete(commentId: string): Promise<{ deleted: boolean; id: string }> {
    try {
      console.log('댓글 삭제 요청:', { commentId });
      const response = await this.client.request<{ deleted: boolean; id: string }>({
        url: `/admin/comments/${commentId}`,
        method: 'DELETE',
      });
      console.log('댓글 삭제 응답:', response);
      return response;
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      throw error;
    }
  }
}
