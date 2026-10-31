'use client';

import { ReactNode, useState, createContext, useContext, useId, useRef } from 'react';
import { Toast as ToastComponent } from '@/components/ui/Toast';
import type { ToastProps as ToastPropsType } from '@/components/ui/Toast';

interface ToastContextType {
  showToast: (props: Omit<ToastPropsType, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastPropsType[]>([]);
  const toastPrefix = useId();
  const nextToastId = useRef(0);

  const showToast = (props: Omit<ToastPropsType, 'id'>) => {
    const id = `${toastPrefix}-${nextToastId.current++}`;
    setToasts((prev) => [...prev, { ...props, id, onClose: () => removeToast(id) }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastContainerProps {
  toasts: ToastPropsType[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:items-end sm:justify-end">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}
