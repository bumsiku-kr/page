'use client';

import React from 'react';
import Image from 'next/image';

interface ProfileImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  priority?: boolean;
}

export default function ProfileImage({
  src,
  alt,
  size = 'md',
  className = '',
  priority = false,
}: ProfileImageProps) {
  const sizeClasses = {
    sm: 'w-16 h-16', // 64px
    md: 'w-24 h-24', // 96px
    lg: 'w-32 h-32', // 128px
    xl: 'w-40 h-40', // 160px
    xxl: 'w-56 h-56', // 224px
  };

  const sizeValues = {
    sm: 64,
    md: 96,
    lg: 128,
    xl: 160,
    xxl: 224,
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <Image
        src={src}
        alt={alt}
        className="rounded-full object-cover border-4 border-gray-200 shadow-lg"
        width={sizeValues[size]}
        height={sizeValues[size]}
        priority={priority}
      />
    </div>
  );
} 