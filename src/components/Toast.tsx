import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-[#282725] border border-[#44423e] shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-[#d97706]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-semibold text-[#f5f4ef]">{toast.title}</h5>
            {toast.description && (
              <p className="text-[11px] text-[#a8a29e] mt-0.5 leading-snug">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-[#78716c] hover:text-[#f5f4ef] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
