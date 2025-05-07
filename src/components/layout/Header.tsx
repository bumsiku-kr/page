'use client';

import Link from 'next/link';
import Container from '../ui/Container';
import SocialLink from '../ui/SocialLink';

export default function Header() {
  return (
    <header className="bg-white shadow-sm py-4 px-6 fixed w-full top-0 z-10">
      <Container size="md" className="relative">
        <div className="flex justify-between items-center">
          {/* 로고 */}
          <Link href="/" className="text-2xl font-medium text-gray-800 font-mono" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            <span className="font-extrabold">Siku</span>.class
          </Link>

          {/* 소셜 아이콘 */}
          <div className="flex space-x-4">
            <SocialLink type="github" href="https://github.com/SIKU-KR" label="GitHub" />
            <SocialLink type="linkedin" href="https://linkedin.com/in/siku-kr" label="LinkedIn" />
            <SocialLink type="instagram" href="https://www.instagram.com/bam_siku_/" label="Instagram" />
          </div>
        </div>
      </Container>
    </header>
  );
}
