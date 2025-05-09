'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: '게시글 관리', path: '/admin/posts' },
    { label: '댓글 관리', path: '/admin/comments' },
    { label: '카테고리 관리', path: '/admin/categories' },
  ];

  return (
    <aside className="w-full md:w-64 bg-gray-800 text-white md:fixed md:h-full md:top-16 md:left-0 md:overflow-y-auto">
      <nav className="py-6">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-1">
              <Link
                href={item.path}
                className={`flex items-center px-6 py-3 hover:bg-gray-700 ${
                  pathname === item.path ? 'bg-gray-700' : ''
                }`}
              >
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 