'use client';

import React from 'react';
import ProfileImage from '../ui/ProfileImage';
import Link from 'next/link';
import Button from '../ui/Button';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  className?: string;
}

export default function HeroSection({
  title,
  subtitle,
  imageSrc,
  className = '',
}: HeroSectionProps) {
  return (
    <section className={`py-8 md:py-12 ${className}`}>
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* 프로필 이미지 */}
        <ProfileImage
          src={imageSrc}
          alt="프로필 이미지"
          size="xxl"
          priority
        />

        {/* 자기소개 */}
        <div className="flex flex-col space-y-6 text-center md:text-left">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {title}
            </h1>
            <p className="text-xl text-gray-600 whitespace-pre-line">{subtitle}</p>
            
            <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              <Link href="/portfolio">
                <Button variant="primary" size="md">
                  Portfolio
                </Button>
              </Link>
              <Link href="mailto:peter012677@naver.com">
                <Button variant="secondary" size="md">
                  E-mail
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 