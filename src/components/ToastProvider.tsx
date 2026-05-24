import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { IconCheck, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bg = 'bg-white';
            let border = 'border-gray-200';
            let icon = null;
            let textCol = 'text-gray-800';

            if (toast.type === 'success') {
              bg = 'bg-[#d1fae5]';
              border = 'border-[#6ee7b7]';
              icon = <IconCheck className="text-[#047857]" size={20} />;
              textCol = 'text-[#047857]';
            } else if (toast.type === 'error') {
              bg = 'bg-[#fee2e2]';
              border = 'border-[#fca5a5]';
              icon = <IconAlertCircle className="text-[#991b1b]" size={20} />;
              textCol = 'text-[#991b1b]';
            } else if (toast.type === 'info') {
              bg = 'bg-[#ede9fe]';
              border = 'border-[#c4b5fd]';
              icon = <IconInfoCircle className="text-[#4c1d95]" size={20} />;
              textCol = 'text-[#3730a3]';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                className={twMerge(
                  "flex items-center gap-3 px-4 py-3 border border-solid rounded-xl shadow-lg pointer-events-auto",
                  bg, border
                )}
                style={{ borderRadius: '12px' }}
              >
                {icon}
                <span className={clsx("font-medium text-sm", textCol)}>{toast.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
