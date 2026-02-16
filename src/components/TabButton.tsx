interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wide transition-colors ${
        active
          ? 'bg-white text-black'
          : 'bg-white/20 text-white hover:bg-white/30'
      }`}
    >
      {children}
    </button>
  );
}
