import { useState, useCallback, useEffect } from 'react';

let toastFn = null;

export function showToast(msg, type = 'success') {
  if (toastFn) toastFn(msg, type);
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastFn = (msg, type) => {
      const id = Date.now();
      setToasts(t => [...t, { id, msg, type }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    };
    return () => { toastFn = null; };
  }, []);

  const bgMap = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-accent2',
    warning: 'bg-yellow-500',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`
            ${bgMap[t.type] || 'bg-ink'} text-white px-5 py-3 rounded-xl
            shadow-xl text-sm font-medium max-w-xs animate-fade-in
          `}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
