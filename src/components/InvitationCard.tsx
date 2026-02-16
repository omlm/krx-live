import { useState } from 'react';
import { Invitation } from '../types/user';

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
    <div className="bg-white/10 px-4 py-3">
      <div className="text-white text-sm mb-1">
        <span className="font-bold">{invitation.from_user_name}</span>
        {' '}inviterer deg til
      </div>
      <div className="text-white font-bold uppercase tracking-tight">
        {invitation.concert?.artist_name} @ {invitation.concert?.venue}
      </div>
      <div className="text-white/50 text-xs mb-3">
        {invitation.concert?.date} {invitation.concert?.time}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleRespond('accepted')}
          disabled={responding}
          className="bg-green-500/20 text-green-400 px-4 py-1.5 text-xs font-bold uppercase tracking-wide hover:bg-green-500/30 transition-colors disabled:opacity-50"
        >
          Aksepter
        </button>
        <button
          onClick={() => handleRespond('declined')}
          disabled={responding}
          className="bg-white/10 text-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          Avslå
        </button>
      </div>
    </div>
  );
}
