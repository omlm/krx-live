import { useState, useEffect, useCallback, ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  const close = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setVisible(false);
      setAnimating(false);
      document.body.style.overflow = '';
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (open && !visible) {
      setVisible(true);
      setAnimating(false);
      document.body.style.overflow = 'hidden';
    }
  }, [open, visible]);

  useEffect(() => {
    if (!open && visible && !animating) {
      close();
    }
  }, [open, visible, animating, close]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!visible) return null;

  const closing = animating;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80"
        style={{
          animation: `${closing ? 'drawer-fade-out' : 'drawer-fade-in'} 0.3s ease-out forwards`,
        }}
        onClick={close}
      />

      {/* Drawer - mobile: bottom sheet, desktop: right panel */}
      <div
        className={`
          fixed bg-neutral-900 overflow-hidden flex flex-col
          bottom-0 left-0 right-0 max-h-[90vh] rounded-t-2xl
          min-[900px]:top-0 min-[900px]:right-0 min-[900px]:left-auto min-[900px]:bottom-0
          min-[900px]:w-[480px] min-[900px]:max-h-none min-[900px]:rounded-none
          ${closing ? 'drawer-exit' : 'drawer-enter'}
        `}
      >
        {/* Handle bar (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 min-[900px]:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <h3 className="text-white text-sm font-bold uppercase tracking-widest">
            {title}
          </h3>
          <button
            onClick={close}
            className="text-white/40 hover:text-white/80 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
