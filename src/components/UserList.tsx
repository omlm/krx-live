import { useState } from 'react';
import { User } from '../types/user';
import styles from './UserList.module.css';

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
      <div className={styles.empty}>
        Ingen brukere.
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {users.map((user) => (
        <div key={user.id} className={styles.item}>
          <div className={styles.itemMain}>
            <div className={styles.name}>
              {user.name}
              {user.is_admin && (
                <span className={styles.adminBadge}>Admin</span>
              )}
            </div>
          </div>
          {user.id !== currentUserId && (
            <button
              onClick={() => handleDelete(user.id, user.name)}
              disabled={deletingId === user.id}
              className={styles.deleteBtn}
            >
              {deletingId === user.id ? '...' : 'Slett'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
