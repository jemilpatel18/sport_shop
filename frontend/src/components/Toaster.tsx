'use client';

import { useUIStore } from '@/stores/uiStore';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'border-brand-lime text-brand-charcoal',
  error: 'border-red-400 text-red-700',
  info: 'border-blue-400 text-blue-700',
};

export default function Toaster() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 bg-white border-l-4 ${colors[t.type]} shadow-lg rounded-lg p-3 animate-[slideIn_0.3s_ease-out]`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
