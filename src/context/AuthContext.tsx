import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { setToken, parseJwt, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: 'https://api.bumsiku.kr',
  withCredentials: true, // 쿠키를 주고받을 수 있도록 설정
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
  loginWithSession: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 세션 데이터 정리
  const clearSessionData = () => {
    document.cookie = 'JSESSIONID=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
  };

  // 로그아웃 함수
  const logout = useCallback(() => {
    try {
      // 서버에 로그아웃 요청 (필요한 경우)
      api.post('/logout').catch(() => {
        // 에러가 발생해도 클라이언트 측 로그아웃은 진행
      }).finally(() => {
        clearSessionData();
        router.push('/login');
      });
    } catch (error) {
      clearSessionData();
      router.push('/login');
    }
  }, [router]);

  // 인증 상태 확인 함수
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await api.get('/session', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.authenticated) {
        setUser(response.data.user);
        return true;
      }
      return false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      clearSessionData();
      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const init = async () => {
      setIsLoading(true);
      try {
        await checkAuthStatus();
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [checkAuthStatus]);

  const login = (token: string) => {
    setToken(token);
    const userData = parseJwt(token);
    
    if (userData) {
      setUser(userData);
    }
  };

  const loginWithSession = async (username: string, password: string) => {
    try {
      const response = await api.post('/login', {
        username,
        password
      });
      
      if (response.status === 200) {
        await checkAuthStatus();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw _error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      login, 
      logout,
      loginWithSession,
      isLoading,
      checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
