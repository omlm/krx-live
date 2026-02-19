import { Concert, ConcertStatus } from '../types/concert';
import { SentInvitation } from '../types/user';
import { ConcertExpandCard } from './ConcertExpandCard';
import styles from './ConcertList.module.css';

interface ConcertListProps {
  concerts: Concert[];
  statuses?: Record<string, ConcertStatus>;
  sentInvitations?: SentInvitation[];
  onStatusChange?: (concertId: string, status: ConcertStatus | null) => void;
  onInvite?: (concertId: string) => void;
  onEdit?: (concertId: string, data: any) => Promise<void>;
  onDelete?: (concertId: string) => Promise<void>;
  isAdmin?: boolean;
  resetKey?: string;
}

export function ConcertList({ concerts, statuses, sentInvitations, onStatusChange, onInvite, onEdit, onDelete, isAdmin, resetKey = '' }: ConcertListProps) {
  return (
    <div className={styles.list}>
      <div className={styles.items}>
        {concerts.map((concert) => (
          <ConcertExpandCard
            key={`${resetKey}-${concert.id}`}
            concert={concert}
            status={statuses?.[concert.id] || null}
            sentInvitations={sentInvitations?.filter(inv => inv.concert_id === concert.id)}
            onStatusChange={onStatusChange}
            onInvite={onInvite}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {concerts.length === 0 && (
        <div className={styles.empty}>
          Ingen konserter i denne kategorien
        </div>
      )}
    </div>
  );
}
