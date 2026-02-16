import { Concert, ConcertStatus } from '../types/concert';
import { ConcertExpandCard } from './ConcertExpandCard';

interface ConcertListProps {
  concerts: Concert[];
  statuses?: Record<string, ConcertStatus>;
  onStatusChange?: (concertId: string, status: ConcertStatus | null) => void;
  onInvite?: (concertId: string) => void;
  onEdit?: (concertId: string, data: any) => Promise<void>;
  isAdmin?: boolean;
  resetKey?: string;
}

export function ConcertList({ concerts, statuses, onStatusChange, onInvite, onEdit, isAdmin, resetKey = '' }: ConcertListProps) {
  return (
    <div className="px-4 pb-8">
      <div className="space-y-5">
        {concerts.map((concert) => (
          <ConcertExpandCard
            key={`${resetKey}-${concert.id}`}
            concert={concert}
            status={statuses?.[concert.id] || null}
            onStatusChange={onStatusChange}
            onInvite={onInvite}
            onEdit={onEdit}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {concerts.length === 0 && (
        <div className="text-white text-center py-12 text-sm opacity-60">
          Ingen konserter i denne kategorien
        </div>
      )}
    </div>
  );
}
