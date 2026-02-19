import { useState } from 'react';
import { Invitation } from '../types/user';
import styles from './InvitationCard.module.css';

interface InvitationCardProps {
  invitation: Invitation;
  onRespond: (invitationId: string, response: 'accepted' | 'declined', concertId: string) => Promise<void>;
}

export function InvitationCard({ invitation, onRespond }: InvitationCardProps) {
  const [responding, setResponding] = useState(false);

  async function handleRespond(response: 'accepted' | 'declined') {
    setResponding(true);
    await onRespond(invitation.id, response, invitation.concert_id);
    setResponding(false);
  }

  return (
    <div className={styles.card}>
      <div className={styles.sender}>
        <span className={styles.bold}>{invitation.from_user_name}</span>
        {' '}inviterer deg til
      </div>
      <div className={styles.concertName}>
        {invitation.concert?.artist_name} @ {invitation.concert?.venue}
      </div>
      <div className={styles.datetime}>
        {invitation.concert?.date} {invitation.concert?.time}
      </div>
      <div className={styles.actions}>
        <button
          onClick={() => handleRespond('accepted')}
          disabled={responding}
          className="btn btn-success"
        >
          Aksepter
        </button>
        <button
          onClick={() => handleRespond('declined')}
          disabled={responding}
          className="btn btn-ghost"
        >
          Avslå
        </button>
      </div>
    </div>
  );
}
