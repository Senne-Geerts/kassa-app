'use client';

import { cn } from '@/lib/cn';
import { ComponentPropsWithoutRef } from 'react';

export const Card = ({ className, children, ...props }: ComponentPropsWithoutRef<'div'>) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: ComponentPropsWithoutRef<'div'>) => {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>{children}</div>;
};

export const CardTitle = ({ className, children, ...props }: ComponentPropsWithoutRef<'h3'>) => {
  return (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ className, children, ...props }: ComponentPropsWithoutRef<'p'>) => {
  return <p className={cn('text-sm text-zinc-500 dark:text-zinc-400', className)} {...props}>{children}</p>;
};

export const CardContent = ({ className, children, ...props }: ComponentPropsWithoutRef<'div'>) => {
  return <div className={cn('p-6 pt-0', className)} {...props}>{children}</div>;
};

export const CardFooter = ({ className, children, ...props }: ComponentPropsWithoutRef<'div'>) => {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props}>{children}</div>;
};
