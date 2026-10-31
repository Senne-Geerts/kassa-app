'use client';

import { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface FormFieldProps extends ComponentPropsWithoutRef<'div'> {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  required?: boolean;
}

export const FormField = ({ className, label, description, error, required, children, ...props }: FormFieldProps) => {
  return (
    <div className={className} {...props}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {description && <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>}
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
