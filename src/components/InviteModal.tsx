import { useState } from 'react';
import { User } from '../types/user';
import { SentInvitation } from '../types/user';
import styles from './InviteModal.module.css';

interface InviteModalProps {
  users: User[];
  sentInvitations?: SentInvitation[];
  onInvite: (toUserId: string) => Promise<void>;
  onClose: () => void;
}

export function InviteModal({ users, sentInvitations = [], onInvite, onClose }: InviteModalProps) {
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Build a map of user name -> invitation status
  const invStatusByName: Record<string, string> = {};
  sentInvitations.forEach((inv) => {
    invStatusByName[inv.to_user_name] = inv.status;
  });

  async function handleInvite(userId: string) {
    setSending(userId);
    setError(null);
    try {
      await onInvite(userId);
      setSent(prev => new Set(prev).add(userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke sende invitasjon');
    } finally {
      setSending(null);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            Inviter
          </h3>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div className={styles.list}>
          {users.length === 0 ? (
            <div className={styles.empty}>
              Ingen brukere å invitere
            </div>
          ) : (
            users.map((user) => {
              const invStatus = invStatusByName[user.name];

              return (
                <div key={user.id} className={styles.listItem}>
                  <span className={styles.userName}>{user.name}</span>
                  {invStatus === 'accepted' ? (
                    <span className={styles.statusAccepted}>Akseptert</span>
                  ) : sent.has(user.id) || invStatus === 'pending' ? (
                    <span className={styles.statusSent}>Sendt</span>
                  ) : invStatus === 'declined' ? (
                    <span className={styles.statusDeclined}>Avvist</span>
                  ) : (
                    <button
                      onClick={() => handleInvite(user.id)}
                      disabled={sending === user.id}
                      className={styles.inviteBtn}
                    >
                      {sending === user.id ? '...' : 'Inviter'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
