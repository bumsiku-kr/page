'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Tag } from '../../types';

interface TagSidebarProps {
  selectedTag?: string;
  tags?: Tag[];
  totalPostCount?: number;
}

export default function TagSidebar({
  selectedTag,
  tags = [],
  totalPostCount: _totalPostCount = 0,
}: TagSidebarProps) {
  const searchParams = useSearchParams();

  const getTagUrl = (tagName?: string) => {
    // SSR 안전한 URL 생성
    const params = new URLSearchParams();

    // searchParams가 있으면 복사 (클라이언트에서만)
    if (typeof window !== 'undefined' && searchParams) {
      for (const [key, value] of searchParams.entries()) {
        if (key !== 'tag' && key !== 'page') {
          params.set(key, value);
        }
      }
    }

    if (tagName) {
      params.set('tag', tagName);
    }

    params.set('page', '1');

    const queryString = params.toString();
    return queryString ? `/?${queryString}` : '/';
  };

  // 정렬: postCount 내림차순, 이름 오름차순 (SSR 안전)
  const sortedTags = [...tags].sort((a, b) => {
    const byCount = (b.postCount || 0) - (a.postCount || 0);
    if (byCount !== 0) return byCount;
    // 안전한 문자열 정렬 (localeCompare 대신)
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">태그</h2>
      <ul className="space-y-2">
        {sortedTags.map(tag => (
          <li key={tag.id}>
            <Link
              href={selectedTag === tag.name ? getTagUrl(undefined) : getTagUrl(tag.name)}
              className={`flex items-center w-full text-left py-1 px-2 rounded-md transition-colors ${
                selectedTag === tag.name ? 'font-semibold bg-gray-100' : ''
              }`}
            >
              #{tag.name}
              <span className="text-sm ml-1">({tag.postCount})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
