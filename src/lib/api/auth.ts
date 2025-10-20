import { APIClient, API_ENDPOINTS } from './client';
import { setToken, parseJwt, User } from '@/lib/auth';

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

export class AuthService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * 세션 상태 확인
   */
  async checkSession(): Promise<SessionResponse> {
    try {
      const response = await this.client.request<SessionResponse>({
        url: '/session',
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error('세션 확인 오류:', error);
      return { authenticated: false };
    }
  }

  /**
   * 로그인 (세션 기반)
   */
  async login(username: string, password: string): Promise<void> {
    await this.client.request<void>({
      url: API_ENDPOINTS.LOGIN,
      method: 'POST',
      data: { username, password },
    });
  }

  /**
   * 로그인 (토큰 기반) - 레거시 지원
   */
  loginWithToken(token: string): User | null {
    setToken(token);
    return parseJwt(token);
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await this.client.request<void>({
        url: '/logout',
        method: 'POST',
      });
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  }
}
