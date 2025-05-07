'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hasShadow?: boolean;
  hasBorder?: boolean;
  isPadded?: boolean;
  isHoverable?: boolean;
}

export default function Card({
  children,
  className = '',
  hasShadow = true,
  hasBorder = true,
  isPadded = true,
  isHoverable = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg
        ${hasShadow ? 'shadow-sm' : ''}
        ${hasBorder ? 'border border-gray-100' : ''}
        ${isPadded ? 'p-5' : ''}
        ${isHoverable ? 'transition-shadow hover:shadow-md' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// 추가 컴포넌트로 Card의 구조화된 사용을 위한 서브컴포넌트
Card.Header = function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}; 