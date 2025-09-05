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
    const params = new URLSearchParams(searchParams);

    if (!tagName) {
      params.delete('tag');
    } else {
      params.set('tag', tagName);
    }

    params.set('page', '1');

    const queryString = params.toString();
    return queryString ? `/?${queryString}` : '/';
  };

  // 정렬: postCount 내림차순, 이름 오름차순
  const sortedTags = [...tags].sort((a, b) => {
    const byCount = (b.postCount || 0) - (a.postCount || 0);
    if (byCount !== 0) return byCount;
    return a.name.localeCompare(b.name);
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
