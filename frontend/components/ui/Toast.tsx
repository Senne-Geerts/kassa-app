'use client';

import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ComponentPropsWithoutRef, ReactNode, useEffect, useState } from 'react';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[--radix-toast-swipe-end-x] data-[swipe=move]:translate-x-[--radix-toast-swipe-move-x] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
        destructive: 'destructive group border-red-500 bg-red-500 text-white dark:border-red-900 dark:bg-red-900',
        success: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface ToastProps extends ComponentPropsWithoutRef<'div'> {
  variant?: 'default' | 'destructive' | 'success';
  onClose: () => void;
  title?: string;
  description?: ReactNode;
  id?: string;
}

export const Toast = ({ className, variant, onClose, title, description, ...props }: ToastProps) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      {...props}
      style={{ animationDuration: '300ms' }}
    >
      <div className="flex gap-3">
        <div className="flex-1 py-1">
          {title && <div className="mb-1 font-medium">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      </div>
      <button
        className="absolute right-2 top-2 rounded-md p-1 text-zinc-500 opacity-0 transition-opacity hover:text-zinc-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 dark:text-zinc-400 dark:hover:text-zinc-50"
        onClick={(e) => {
          e.preventDefault();
          setIsClosing(true);
          onClose();
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:items-end sm:justify-end">
      {toasts.map((toast) => (
        <Toast key={toast.id || Math.random().toString()} {...toast} onClose={() => onRemove(toast.id || '')} />
      ))}
    </div>
  );
};
