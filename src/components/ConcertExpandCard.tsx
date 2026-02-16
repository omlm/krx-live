import { useState, useRef } from 'react';
import { Concert, ConcertStatus } from '../types/concert';
import { ConcertForm } from './ConcertForm';

interface ConcertExpandCardProps {
  concert: Concert;
  status?: ConcertStatus | null;
  onStatusChange?: (concertId: string, status: ConcertStatus | null) => void;
  onInvite?: (concertId: string) => void;
  onEdit?: (concertId: string, data: any) => Promise<void>;
  isAdmin?: boolean;
}

export function ConcertExpandCard({
  concert,
  status = null,
  onStatusChange,
  onInvite,
  onEdit,
  isAdmin,
}: ConcertExpandCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const dateObj = new Date(concert.date);
  const day = `${dateObj.getDate()}. ${dateObj.toLocaleDateString('nb-NO', { month: 'short' }).replace('.', '').toUpperCase()}`;

  const hasActions = onStatusChange || onInvite;

  async function handleEdit(data: any) {
    setEditError(null);
    setEditSuccess(null);
    try {
      await onEdit?.(concert.id, data);
      setEditSuccess('Oppdatert!');
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Kunne ikke oppdatere');
    }
  }

  return (
    <div
      className="bg-white/5 cursor-pointer transition-colors hover:bg-white/[0.08]"
      onClick={() => { if (!editing) setExpanded(!expanded); }}
    >
      {/* Collapsed header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-white/50 text-sm font-medium tabular-nums shrink-0">
            {day}
          </span>
          <span className="text-white text-sm sm:text-base font-bold uppercase tracking-tight truncate">
            {concert.artist_name}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-white/40 shrink-0 ml-3 transition-transform duration-300 ease-out ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Animated expand/collapse */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div ref={contentRef} className="px-4 pb-4" onClick={(e) => e.stopPropagation()}>
            <div className="border-t border-white/10 pt-3">
              {editing ? (
                <div>
                  <ConcertForm
                    onSubmit={handleEdit}
                    error={editError}
                    success={editSuccess}
                    submitLabel="Lagre"
                    initialData={{
                      artist_name: concert.artist_name,
                      venue: concert.venue,
                      date: concert.date,
                      time: concert.time,
                      image_url: concert.image_url,
                      description: concert.description,
                      organizer: concert.organizer,
                      genre: concert.genre || '',
                      original_url: concert.original_url || '',
                    }}
                  />
                  <button
                    onClick={() => setEditing(false)}
                    className="mt-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-white/10 text-white/50 hover:bg-white/20 transition-colors"
                  >
                    Avbryt
                  </button>
                </div>
              ) : (
                <>
                  {concert.original_url ? (
                    <a
                      href={concert.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 text-sm hover:text-white/80 underline transition-colors"
                    >
                      {concert.venue} {concert.time}
                    </a>
                  ) : (
                    <div className="text-white/60 text-sm">
                      {concert.venue} {concert.time}
                    </div>
                  )}

                  {concert.description && (
                    <p className="text-white/40 text-sm mt-2 leading-relaxed">
                      {concert.description}
                    </p>
                  )}

                  {concert.organizer && (
                    <p className="text-white/30 text-xs mt-2 uppercase tracking-wide">
                      Arr: {concert.organizer}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {hasActions && (
                      <>
                        {onStatusChange && status !== 'going' && (
                          <button
                            onClick={() => onStatusChange(concert.id, 'going')}
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors bg-white/10 text-white/50 hover:bg-white/20"
                          >
                            Skal gå
                          </button>
                        )}
                        {onInvite && (
                          <button
                            onClick={() => onInvite(concert.id)}
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-white/10 text-white/50 hover:bg-white/20 transition-colors"
                          >
                            Inviter
                          </button>
                        )}
                        {onStatusChange && status === 'going' && (
                          <button
                            onClick={() => onStatusChange(concert.id, null)}
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            Skal ikke gå
                          </button>
                        )}
                      </>
                    )}
                    {isAdmin && onEdit && (
                      <button
                        onClick={() => setEditing(true)}
                        className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-white/10 text-white/50 hover:bg-white/20 transition-colors"
                      >
                        Endre
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
