import { Concert } from '../types/concert';
import { ConcertCard } from './ConcertCard';
import { groupConcertsByDate } from '../lib/dateUtils';

interface ConcertListProps {
  concerts: Concert[];
}

export function ConcertList({ concerts }: ConcertListProps) {
  const groupedConcerts = groupConcertsByDate(concerts);

  return (
    <div className="px-4 pb-8">
      {Object.entries(groupedConcerts).map(([dateLabel, concerts]) => (
        <div key={dateLabel} className="mb-6">
          <h2 className="text-white text-sm font-bold mb-3 uppercase tracking-widest">
            {dateLabel}
          </h2>
          {concerts.map((concert) => (
            <ConcertCard key={concert.id} concert={concert} />
          ))}
        </div>
      ))}
      
      {concerts.length === 0 && (
        <div className="text-white text-center py-12 text-sm opacity-60">
          Ingen konserter i denne kategorien
        </div>
      )}
    </div>
  );
}
