'use client';

import { SortOption } from '@/types';

interface SortButtonTranslations {
  views: string;
  latest: string;
}

interface SortButtonProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
  translations?: SortButtonTranslations;
}

const SortButton = ({ currentSort, onSortChange, className = '', translations }: SortButtonProps) => {
  const sortOptions = [
    { value: 'views,desc' as SortOption, label: translations?.views || 'Popular' },
    { value: 'createdAt,desc' as SortOption, label: translations?.latest || 'Latest' },
  ];
  const currentValue = currentSort.includes('views') ? 'views,desc' : 'createdAt,desc';

  return (
    <div className={`inline-flex rounded-lg bg-gray-100 p-1 ${className}`}>
      {sortOptions.map(option => {
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
