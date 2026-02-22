import { useEffect } from 'react';

export default function Modal({ open, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-9 w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        {title && (
          <div className="mb-1">
            <h3 className="font-syne text-xl font-extrabold text-ink">{title}</h3>
            {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
          </div>
        )}
        <div className={title ? 'mt-6' : ''}>{children}</div>
        {footer && (
          <div className="flex gap-3 justify-end pt-5 border-t border-border mt-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
