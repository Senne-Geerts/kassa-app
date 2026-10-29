'use client';

import { ComponentPropsWithoutRef, ReactNode } from 'react';

export const Section = ({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) => {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
          {description && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  );
};
