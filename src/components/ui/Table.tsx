import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className || ''}`} {...props} />
    </div>
  );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead className={`bg-gray-100 ${className || ''}`} {...props} />;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={`[&_tr:nth-child(even)]:bg-gray-50 ${className || ''}`} {...props} />;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr className={`border-b border-gray-200 ${className || ''}`} {...props} />;
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export function TableHead({
  className,
  children,
  sortable,
  sorted,
  onSort,
  ...props
}: TableHeadProps) {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-medium text-gray-500 ${
        sortable ? 'cursor-pointer select-none' : ''
      } ${className || ''}`}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && (
          <div className="flex flex-col ml-1">
            <span
              className={`h-2 w-2 -mb-0.5 ${sorted === 'asc' ? 'text-blue-600' : 'text-gray-300'}`}
            >
              ▲
            </span>
            <span className={`h-2 w-2 ${sorted === 'desc' ? 'text-blue-600' : 'text-gray-300'}`}>
              ▼
            </span>
          </div>
        )}
      </div>
    </th>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableCell({ className, ...props }: TableCellProps) {
  return <td className={`p-4 align-middle ${className || ''}`} {...props} />;
}
