import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(name, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full bg-white/10 text-white border border-white/20 px-4 py-3 text-sm ' +
    'placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-colors';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-5xl font-black tracking-tight mb-2 text-center">
          KRX LIVE
        </h1>
        <p className="text-white/40 text-sm text-center mb-8 uppercase tracking-widest">
          Logg inn
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Brukernavn"
              required
              autoFocus
              className={inputClass}
            />
          </div>
          <div>
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
            <div className="text-red-400 text-sm bg-red-400/10 px-4 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name || !password}
            className="w-full bg-white text-black py-3 text-sm font-bold uppercase tracking-wide hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logger inn...' : 'Logg inn'}
          </button>
        </form>
      </div>
    </div>
  );
}
