'use client';

import { Suspense } from 'react';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="flex justify-end px-4 pt-4 sm:px-6">
        <ThemeToggle />
      </header>
      <Suspense>
        <ToastProvider>{children}</ToastProvider>
      </Suspense>
    </>
  );
}
