import { Concert } from '../types/concert';
import styles from './ConcertCard.module.css';

interface ConcertCardProps {
  concert: Concert;
}

export function ConcertCard({ concert }: ConcertCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        {concert.artist_name} @ {concert.venue}
      </h3>
      <p className={styles.description}>
        {concert.description}
      </p>
      <p className={styles.meta}>
        ARR: {concert.organizer}
      </p>
    </div>
  );
}
