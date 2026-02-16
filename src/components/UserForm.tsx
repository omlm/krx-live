import { useState } from 'react';

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

  const inputClass =
    'w-full bg-white/10 text-white border border-white/20 px-4 py-3 text-sm ' +
    'placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Brukernavn"
          required
          className={inputClass}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passord"
          required
          className={inputClass}
        />
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-400/10 px-4 py-2">{error}</div>
      )}
      {success && (
        <div className="text-green-400 text-sm bg-green-400/10 px-4 py-2">{success}</div>
      )}

      <button
        type="submit"
        disabled={submitting || !name || !password}
        className="w-full bg-white text-black py-3 text-sm font-bold uppercase tracking-wide hover:bg-white/90 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Oppretter...' : 'Opprett bruker'}
      </button>
    </form>
  );
}
