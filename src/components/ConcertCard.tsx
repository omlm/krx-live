import { Concert } from '../types/concert';

interface ConcertCardProps {
  concert: Concert;
}

export function ConcertCard({ concert }: ConcertCardProps) {
  return (
    <div className="bg-white rounded-sm p-5 mb-4 shadow-sm">
      <h3 className="text-lg font-bold mb-2 uppercase tracking-tight">
        {concert.artist_name} @ {concert.venue}
      </h3>
      <p className="text-sm text-gray-800 mb-3 leading-relaxed">
        {concert.description}
      </p>
      <p className="text-xs font-medium uppercase tracking-wide">
        ARR: {concert.organizer}
      </p>
    </div>
  );
}
