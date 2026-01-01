import React from 'react';

interface DividerProps {
  className?: string;
  type?: 'horizontal' | 'vertical';
  variant?: 'line' | 'border';
}

export default function Divider({
  className = '',
  type = 'horizontal',
  variant = 'line',
}: DividerProps) {
  if (variant === 'line') {
    return (
      <hr
        className={`w-full my-4 border-gray-200 ${
          type === 'vertical' ? 'h-full border-r' : 'border-t'
        } ${className}`}
      />
    );
  }

  return (
    <div
      className={`w-full my-4 border-gray-300 ${
        type === 'vertical' ? 'h-full border-r' : 'border-t'
      } ${className}`}
    />
  );
}
