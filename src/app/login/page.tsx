'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth';
import axios from 'axios';

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

// API 기본 설정
axios.defaults.withCredentials = true; // 모든 요청에 쿠키 포함

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { loginWithSession, isLoggedIn, isLoading: authLoading } = useAuth();

  // 이미 로그인되어 있으면 admin으로 리다이렉트
  // authLoading이 완료된 후에만 체크
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.push('/admin');
    }
  }, [isLoggedIn, authLoading, router]);

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `https://api.bumsiku.kr/login`,
        {
          username: data.username,
          password: data.password,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && { Origin: window.location.origin }),
          },
        }
      );

      if (response.status === 200) {
        if (typeof window !== 'undefined') {
          if (!document.cookie.includes('JSESSIONID')) {
            document.cookie = `isLoggedIn=true; path=/; max-age=86400; SameSite=None; ${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
          }

          if (data.remember) {
            localStorage.setItem('rememberMe', 'true');
          }

          setTimeout(() => {
            window.location.href = '/admin';
          }, 1000);
        }

        loginWithSession(data.username, data.password);
      } else {
        setError('인증에 실패했습니다.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string }; status?: number } };

      if (errorObj.response?.status === 401) {
        setError('로그인에 실패했습니다. 사용자명과 비밀번호를 확인하세요.');
      } else {
        setError(errorObj.response?.data?.message || '로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">관리자 로그인</h1>
          <p className="mt-2 text-gray-600">계정 정보를 입력하여 로그인하세요</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <div className="space-y-4">
            <Input
              label="사용자명"
              type="text"
              id="username"
              placeholder="관리자 ID를 입력하세요"
              error={errors.username?.message}
              disabled={isSubmitting}
              {...register('username', { required: '사용자명을 입력하세요' })}
            />

            <Input
              label="비밀번호"
              type="password"
              id="password"
              placeholder="비밀번호를 입력하세요"
              error={errors.password?.message}
              disabled={isSubmitting}
              {...register('password', { required: '비밀번호를 입력하세요' })}
            />

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                {...register('remember')}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                로그인 상태 유지
              </label>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting || authLoading} className="w-full">
            {isSubmitting ? '로그인 중...' : authLoading ? '확인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </div>
  );
}
