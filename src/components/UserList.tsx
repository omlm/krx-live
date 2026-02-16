import { useState } from 'react';
import { User } from '../types/user';

interface UserListProps {
  users: User[];
  currentUserId: string;
  onDelete: (userId: string) => Promise<void>;
}

export function UserList({ users, currentUserId, onDelete }: UserListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(userId: string, name: string) {
    if (!window.confirm(`Slette ${name}?`)) return;
    setDeletingId(userId);
    await onDelete(userId);
    setDeletingId(null);
  }

  if (users.length === 0) {
    return (
      <div className="text-white/60 text-sm text-center py-8">
        Ingen brukere.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-white/10 px-4 py-3 flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-bold truncate">
              {user.name}
              {user.is_admin && (
                <span className="ml-2 text-white/40 text-xs font-normal uppercase">Admin</span>
              )}
            </div>
          </div>
          {user.id !== currentUserId && (
            <button
              onClick={() => handleDelete(user.id, user.name)}
              disabled={deletingId === user.id}
              className="ml-4 text-red-400 text-xs font-bold uppercase tracking-wide hover:text-red-300 transition-colors disabled:opacity-50"
            >
              {deletingId === user.id ? '...' : 'Slett'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
