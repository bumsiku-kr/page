'use client';

import React from 'react';
import SocialIcon from './icons/SocialIcon';

type SocialType = 'github' | 'linkedin' | 'twitter' | 'facebook' | 'instagram';

interface SocialLinkProps {
  type: SocialType;
  href: string;
  label?: string;
  className?: string;
}

export default function SocialLink({
  type,
  href,
  label,
  className = '',
}: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-gray-600 hover:text-gray-900 ${className}`}
      aria-label={label || type}
    >
      <SocialIcon type={type} />
    </a>
  );
} 