import { cx } from '../lib/cx';
import styles from './TabButton.module.css';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cx(styles.tab, active ? styles.active : styles.inactive)}
    >
      {children}
    </button>
  );
}
