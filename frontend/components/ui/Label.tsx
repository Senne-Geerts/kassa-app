'use client';

import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { ComponentPropsWithoutRef } from 'react';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-zinc-700 dark:text-zinc-300',
        small: 'text-xs text-zinc-500 dark:text-zinc-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface LabelProps extends ComponentPropsWithoutRef<'label'> {
  variant?: 'default' | 'small';
}

export const Label = ({ className, variant, ...props }: LabelProps) => {
  return <label className={cn(labelVariants({ variant }), className)} {...props} />;
};
