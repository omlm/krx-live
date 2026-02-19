import { useState } from 'react';
import { Concert } from '../types/concert';
import styles from './AdminConcertList.module.css';

interface AdminConcertListProps {
  concerts: Concert[];
  onDelete: (id: string) => Promise<void>;
}

export function AdminConcertList({ concerts, onDelete }: AdminConcertListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, artistName: string) {
    if (!window.confirm(`Slette ${artistName}?`)) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }

  if (concerts.length === 0) {
    return (
      <div className={styles.empty}>
        Ingen konserter lagt til enda.
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {concerts.map((concert) => (
        <div key={concert.id} className={styles.item}>
          <div className={styles.itemMain}>
            <div className={styles.concertName}>
              {concert.artist_name} @ {concert.venue}
            </div>
            <div className={styles.meta}>
              {concert.date} {concert.time}
              {concert.organizer && (
                <> &middot; {concert.organizer}</>
              )}
            </div>
          </div>
          <button
            onClick={() => handleDelete(concert.id, concert.artist_name)}
            disabled={deletingId === concert.id}
            className={styles.deleteBtn}
          >
            {deletingId === concert.id ? '...' : 'Slett'}
          </button>
        </div>
      ))}
    </div>
  );
}
