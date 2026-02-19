import { useState, useEffect, useCallback, ReactNode } from 'react';
import { cx } from '../lib/cx';
import styles from './Drawer.module.css';

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
    <div className={styles.root}>
      {/* Overlay */}
      <div
        className={styles.backdrop}
        style={{
          animation: `${closing ? 'drawer-fade-out' : 'drawer-fade-in'} 0.3s ease-out forwards`,
        }}
        onClick={close}
      />

      {/* Drawer - mobile: bottom sheet, desktop: right panel */}
      <div className={cx(styles.panel, closing ? 'drawer-exit' : 'drawer-enter')}>
        {/* Handle bar (mobile only) */}
        <div className={styles.handle}>
          <div className={styles.handleBar} />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>
            {title}
          </h3>
          <button onClick={close} className={styles.closeBtn}>
            <svg className={styles.closeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
}
