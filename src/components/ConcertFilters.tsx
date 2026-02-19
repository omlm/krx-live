import { useMemo } from 'react';
import { Concert } from '../types/concert';
import styles from './ConcertFilters.module.css';

interface ConcertFiltersProps {
  concerts: Concert[];
  genreFilter: string;
  venueFilter: string;
  onGenreChange: (genre: string) => void;
  onVenueChange: (venue: string) => void;
}

export function ConcertFilters({
  concerts,
  genreFilter,
  venueFilter,
  onGenreChange,
  onVenueChange,
}: ConcertFiltersProps) {
  const genres = useMemo(() => {
    const set = new Set<string>();
    concerts.forEach((c) => {
      if (c.genre) set.add(c.genre);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'nb'));
  }, [concerts]);

  const venues = useMemo(() => {
    const set = new Set<string>();
    concerts.forEach((c) => {
      if (c.venue) set.add(c.venue);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'nb'));
  }, [concerts]);

  if (genres.length === 0 && venues.length <= 1) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        {genres.length > 0 && (
          <select
            value={genreFilter}
            onChange={(e) => onGenreChange(e.target.value)}
            className={styles.select}
          >
            <option value="">Sjanger: Alle</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
        {venues.length > 1 && (
          <select
            value={venueFilter}
            onChange={(e) => onVenueChange(e.target.value)}
            className={styles.select}
          >
            <option value="">Sted: Alle</option>
            {venues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
