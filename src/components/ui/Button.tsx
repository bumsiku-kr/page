'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // 기본 스타일
  const baseStyles =
    'inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';

  // 버튼 크기별 스타일
  const sizeStyles = {
    sm: 'text-xs h-8 px-3',
    md: 'text-sm h-10 px-4',
    lg: 'text-base h-12 px-6',
    icon: 'h-8 w-8 p-0',
  };

  // 버튼 종류별 스타일
  const variantStyles = {
    primary: 'bg-black text-white hover:bg-neutral-800 focus:ring-black',
    secondary: 'bg-white text-black border border-black hover:bg-neutral-100 focus:ring-black',
    outline: 'border border-neutral-400 text-black hover:bg-neutral-100 focus:ring-neutral-500',
    ghost: 'text-black hover:bg-neutral-100 focus:ring-neutral-500',
    link: 'text-black underline hover:text-neutral-700 focus:ring-black p-0 h-auto',
  };

  // 로딩 및 비활성화 상태 스타일
  const stateStyles = isLoading || disabled ? 'opacity-70 cursor-not-allowed' : '';

  // 너비 스타일
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${stateStyles}
        ${widthStyles}
        ${className}
      `}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
