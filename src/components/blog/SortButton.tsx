'use client';

import { useState, useRef, useEffect } from 'react';
import { SortOption } from '../../types';

interface SortButtonProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
  size?: 'sm' | 'md';
}

const SORT_OPTIONS = [
  {
    value: 'createdAt,desc' as SortOption,
    label: '최신',
    isDesc: true,
  },
  {
    value: 'createdAt,asc' as SortOption,
    label: '최신',
    isDesc: false,
  },
  {
    value: 'views,desc' as SortOption,
    label: '조회수',
    isDesc: true,
  },
  {
    value: 'views,asc' as SortOption,
    label: '조회수',
    isDesc: false,
  },
];

const SortButton = ({ currentSort, onSortChange, className = '', size = 'md' }: SortButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption =
    SORT_OPTIONS.find(option => option.value === currentSort) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortSelect = (sortOption: SortOption) => {
    onSortChange(sortOption);
    setIsOpen(false);
  };

  const buttonPadding = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm';
  const buttonGap = size === 'sm' ? 'gap-1' : 'gap-1.5';
  const caretSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const menuWidth = size === 'sm' ? 'w-24' : 'w-28';
  const menuMargin = size === 'sm' ? 'mt-1' : 'mt-2';
  const itemPadding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${buttonGap} ${buttonPadding} font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
      >
        <div className={`flex items-center ${buttonGap}`}>
          <span>{currentOption.label}</span>
          <span className="text-gray-500">{currentOption.isDesc ? '↓' : '↑'}</span>
        </div>
        <svg
          className={`${caretSize} transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute top-full right-0 ${menuMargin} ${menuWidth} bg-white border border-gray-200 rounded-lg shadow-lg z-10`}>
          {SORT_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handleSortSelect(option.value)}
              className={`w-full ${itemPadding} text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors flex items-center gap-1 ${
                option.value === currentSort ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              } ${SORT_OPTIONS.indexOf(option) === 0 ? 'rounded-t-lg' : ''} ${SORT_OPTIONS.indexOf(option) === SORT_OPTIONS.length - 1 ? 'rounded-b-lg' : ''}`}
            >
              <span>{option.label}</span>
              <span className="text-gray-500">{option.isDesc ? '↓' : '↑'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortButton;
