import { useState } from 'react';
import { User } from '../types/user';

interface InviteModalProps {
  users: User[];
  onInvite: (toUserId: string) => Promise<void>;
  onClose: () => void;
}

export function InviteModal({ users, onInvite, onClose }: InviteModalProps) {
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-neutral-900 border border-white/20 w-full max-w-sm">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white text-sm font-bold uppercase tracking-widest">
            Inviter
          </h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-2 max-h-60 overflow-y-auto">
          {users.length === 0 ? (
            <div className="text-white/40 text-sm text-center py-4">
              Ingen brukere å invitere
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
              >
                <span className="text-white text-sm">{user.name}</span>
                {sent.has(user.id) ? (
                  <span className="text-green-400 text-xs font-bold uppercase">Sendt</span>
                ) : (
                  <button
                    onClick={() => handleInvite(user.id)}
                    disabled={sending === user.id}
                    className="text-white/60 text-xs font-bold uppercase tracking-wide hover:text-white transition-colors disabled:opacity-50"
                  >
                    {sending === user.id ? '...' : 'Inviter'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {error && (
          <div className="px-4 py-2 text-red-400 text-xs bg-red-400/10">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
