import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const success = useCallback((msg: string, dur?: number) => toast(msg, 'success', dur), [toast]);
  const error = useCallback((msg: string, dur?: number) => toast(msg, 'error', dur), [toast]);
  const warning = useCallback((msg: string, dur?: number) => toast(msg, 'warning', dur), [toast]);
  const info = useCallback((msg: string, dur?: number) => toast(msg, 'info', dur), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let icon = <Info className="h-5 w-5 text-indigo-500" />;
            let borderClass = "border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-950/20 backdrop-blur-md";
            
            if (t.type === 'success') {
              icon = <CheckCircle className="h-5 w-5 text-emerald-500" />;
              borderClass = "border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/20 backdrop-blur-md";
            } else if (t.type === 'error') {
              icon = <AlertCircle className="h-5 w-5 text-rose-500" />;
              borderClass = "border-rose-500/20 bg-rose-500/10 dark:bg-rose-950/20 backdrop-blur-md";
            } else if (t.type === 'warning') {
              icon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
              borderClass = "border-amber-500/20 bg-amber-500/10 dark:bg-amber-950/20 backdrop-blur-md";
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`flex items-start justify-between p-4 rounded-xl border ${borderClass} shadow-glass-md text-foreground pointer-events-auto`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5">{icon}</div>
                  <p className="text-sm font-medium">{t.message}</p>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-muted-foreground hover:text-foreground ml-3 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
