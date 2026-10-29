'use client';

import { Suspense } from 'react';
import { ToastProvider } from '@/components/ui/ToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ToastProvider>
        {children}
      </ToastProvider>
    </Suspense>
  );
}
