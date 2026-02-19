import { useState, useRef } from 'react';
import { Concert, ConcertStatus } from '../types/concert';
import { SentInvitation } from '../types/user';
import { ConcertForm } from './ConcertForm';
import { cx } from '../lib/cx';
import styles from './ConcertExpandCard.module.css';

interface ConcertExpandCardProps {
  concert: Concert;
  status?: ConcertStatus | null;
  sentInvitations?: SentInvitation[];
  onStatusChange?: (concertId: string, status: ConcertStatus | null) => void;
  onInvite?: (concertId: string) => void;
  onEdit?: (concertId: string, data: any) => Promise<void>;
  onDelete?: (concertId: string) => Promise<void>;
  isAdmin?: boolean;
}

export function ConcertExpandCard({
  concert,
  status = null,
  sentInvitations,
  onStatusChange,
  onInvite,
  onEdit,
  onDelete,
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
      className={styles.card}
      onClick={() => { if (!editing) setExpanded(!expanded); }}
    >
      {/* Collapsed header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.date}>
            {day}
          </span>
          <span className={styles.artist}>
            {concert.artist_name}
          </span>
        </div>
        <svg
          className={cx(styles.chevron, expanded && styles.chevronExpanded)}
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
        className={styles.expandGrid}
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className={styles.expandInner}>
          <div ref={contentRef} className={styles.content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.divider}>
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
                    className={cx('btn btn-ghost', styles.cancelEdit)}
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
                      className={styles.venueLink}
                    >
                      {concert.venue} {concert.time}
                    </a>
                  ) : (
                    <div className={styles.venueText}>
                      {concert.venue} {concert.time}
                    </div>
                  )}

                  {concert.description && (
                    <p className={styles.description}>
                      {concert.description}
                    </p>
                  )}

                  {concert.organizer && (
                    <p className={styles.organizer}>
                      Arr: {concert.organizer}
                    </p>
                  )}

                  {/* Sent invitations */}
                  {sentInvitations && sentInvitations.length > 0 && (
                    <div className={styles.inviteRow}>
                      <span className={styles.inviteLabel}>Invitert:</span>
                      {sentInvitations.map((inv) => (
                        <span key={inv.id} className={styles.inviteItem}>
                          <span className={styles.inviteName}>{inv.to_user_name}</span>
                          {inv.status === 'accepted' && (
                            <svg className={styles.iconAccepted} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {inv.status === 'declined' && (
                            <svg className={styles.iconDeclined} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {inv.status === 'pending' && (
                            <span className={styles.statusPending}>...</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className={styles.actions}>
                    {hasActions && (
                      <>
                        {onStatusChange && status !== 'going' && (
                          <button
                            onClick={() => onStatusChange(concert.id, 'going')}
                            className="btn btn-ghost"
                          >
                            Skal gå
                          </button>
                        )}
                        {onInvite && (
                          <button
                            onClick={() => onInvite(concert.id)}
                            className="btn btn-ghost"
                          >
                            Inviter
                          </button>
                        )}
                        {onStatusChange && status === 'going' && (
                          <button
                            onClick={() => onStatusChange(concert.id, null)}
                            className="btn btn-danger"
                          >
                            Skal ikke gå
                          </button>
                        )}
                      </>
                    )}
                    {isAdmin && onEdit && (
                      <button
                        onClick={() => setEditing(true)}
                        className="btn btn-ghost"
                      >
                        Endre
                      </button>
                    )}
                    {isAdmin && onDelete && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Slette ${concert.artist_name}?`)) {
                            onDelete(concert.id);
                          }
                        }}
                        className="btn btn-danger"
                      >
                        Slett
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
