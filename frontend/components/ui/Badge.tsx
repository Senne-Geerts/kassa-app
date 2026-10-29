'use client';

import { cn } from '@/lib/cn';
import { ComponentPropsWithoutRef } from 'react';

export interface BadgeProps extends ComponentPropsWithoutRef<'div'> {
  variant?: 'default' | 'outline' | 'success' | 'danger' | 'warning';
  children: React.ReactNode;
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900',
    outline: 'text-zinc-950 border border-zinc-200 dark:text-zinc-50 dark:border-zinc-800',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
