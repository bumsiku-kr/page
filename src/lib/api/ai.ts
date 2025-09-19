import { APIClient, API_ENDPOINTS } from './client';

export interface GenerateSummaryRequest {
  text: string;
}

export type GenerateSummaryResponse = { summary: string } | string;

export class AIService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async generateSummary(payload: GenerateSummaryRequest): Promise<{ summary: string }> {
    const response = await this.client.request<GenerateSummaryResponse>({
      url: API_ENDPOINTS.AI_SUMMARY,
      method: 'POST',
      data: payload,
    });
    // 응답이 문자열이면 { summary }로 매핑, 객체면 그대로 사용
    if (typeof response === 'string') {
      return { summary: response };
    }
    if (response && typeof response === 'object' && 'summary' in response) {
      return { summary: String((response as any).summary) };
    }
    return { summary: '' };
  }
}
