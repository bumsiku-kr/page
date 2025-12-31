import { APIClient, API_ENDPOINTS } from './client';

// 단일 포스트 임베딩 생성 응답
export interface EmbeddingResult {
  success: boolean;
  postId: number;
  vectorId?: string;
  error?: string;
}

// 대량 임베딩 생성 응답
export interface BulkEmbeddingResult {
  total: number;
  succeeded: number;
  failed: number;
  results: EmbeddingResult[];
}

export class EmbeddingService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * 단일 포스트의 임베딩 생성/재생성
   * @param postId 포스트 ID
   */
  async embedPost(postId: number): Promise<EmbeddingResult> {
    return this.client.request<EmbeddingResult>({
      url: `/admin/posts/${postId}/embed`,
      method: 'POST',
    });
  }

  /**
   * 모든 포스트의 임베딩 대량 생성 (마이그레이션용)
   */
  async embedAllPosts(): Promise<BulkEmbeddingResult> {
    return this.client.request<BulkEmbeddingResult>({
      url: '/admin/posts/embed/bulk',
      method: 'POST',
    });
  }
}
