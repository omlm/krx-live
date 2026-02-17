import { Drawer } from './Drawer';
import { ConcertForm } from './ConcertForm';

interface ConcertDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  error: string | null;
  success: string | null;
}

export function ConcertDrawer({ open, onClose, onSubmit, error, success }: ConcertDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title="Ny konsert">
      <ConcertForm
        onSubmit={onSubmit}
        error={error}
        success={success}
      />
    </Drawer>
  );
}
