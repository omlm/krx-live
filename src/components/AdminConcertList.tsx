import { useState } from 'react';
import { Concert } from '../types/concert';

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
      <div className="text-white/60 text-sm text-center py-8">
        Ingen konserter lagt til enda.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {concerts.map((concert) => (
        <div
          key={concert.id}
          className="bg-white/10 px-4 py-3 flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-bold uppercase tracking-tight truncate">
              {concert.artist_name} @ {concert.venue}
            </div>
            <div className="text-white/50 text-xs">
              {concert.date} {concert.time}
              {concert.organizer && (
                <> &middot; {concert.organizer}</>
              )}
            </div>
          </div>
          <button
            onClick={() => handleDelete(concert.id, concert.artist_name)}
            disabled={deletingId === concert.id}
            className="ml-4 text-red-400 text-xs font-bold uppercase tracking-wide hover:text-red-300 transition-colors disabled:opacity-50"
          >
            {deletingId === concert.id ? '...' : 'Slett'}
          </button>
        </div>
      ))}
    </div>
  );
}
