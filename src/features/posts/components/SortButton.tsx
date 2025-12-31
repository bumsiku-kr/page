'use client';

import { SortOption } from '@/types';

interface SortButtonProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'views,desc' as SortOption, label: '조회순' },
  { value: 'createdAt,desc' as SortOption, label: '최신순' },
];

const SortButton = ({ currentSort, onSortChange, className = '' }: SortButtonProps) => {
  const currentValue = currentSort.includes('views') ? 'views,desc' : 'createdAt,desc';

  return (
    <div className={`inline-flex rounded-lg bg-gray-100 p-1 ${className}`}>
      {SORT_OPTIONS.map(option => {
        const isActive = option.value === currentValue;
        return (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SortButton;
