import { useState } from 'react';
import styles from './UserForm.module.css';

interface UserFormProps {
  onSubmit: (name: string, password: string) => Promise<void>;
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await onSubmit(name, password);
      setSuccess(`Bruker "${name}" opprettet!`);
      setName('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke opprette bruker');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Brukernavn"
          required
          className="input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passord"
          required
          className="input"
        />
      </div>

      {error && (
        <div className="alert-error">{error}</div>
      )}
      {success && (
        <div className="alert-success">{success}</div>
      )}

      <button
        type="submit"
        disabled={submitting || !name || !password}
        className="btn btn-primary"
      >
        {submitting ? 'Oppretter...' : 'Opprett bruker'}
      </button>
    </form>
  );
}
