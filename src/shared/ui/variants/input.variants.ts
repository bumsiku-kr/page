import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Input component variants using CVA
 */
export const inputVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:ring-blue-600',
        error: 'border-red-500 focus-visible:ring-red-600',
      },
      inputSize: {
        sm: 'h-9 text-sm',
        md: 'h-10 text-base',
        lg: 'h-11 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;
