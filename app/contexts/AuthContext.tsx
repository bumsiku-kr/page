'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

// 기본값 설정
const defaultAuthContext: AuthContextType = {
  isLoggedIn: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  error: null,
};

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// 인증 컨텍스트 사용을 위한 훅
export const useAuth = () => useContext(AuthContext);

// 인증 컨텍스트 제공자 컴포넌트
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 초기 로그인 상태 체크
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const status = await api.auth.checkAuth();
        setIsLoggedIn(status);
      } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 로그인 함수
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.auth.login({ username, password });
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    // 백엔드의 로그아웃 API가 있다면 여기서 호출
    // 쿠키 기반 인증이므로 페이지 리로드로 세션 쿠키가 만료되면 로그아웃됩니다
    setIsLoggedIn(false);
    window.location.href = '/admin'; // 로그인 페이지로 리다이렉트
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
