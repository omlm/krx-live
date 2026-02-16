import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Concert } from '../types/concert';
import { User } from '../types/user';
import { useAuth } from '../context/AuthContext';
import { ConcertForm } from '../components/ConcertForm';
import { AdminConcertList } from '../components/AdminConcertList';
import { UserForm } from '../components/UserForm';
import { UserList } from '../components/UserList';
import { extractConcertFromUrl, ExtractedConcertData } from '../lib/urlParser';
import {
  loadAllConcerts,
  addConcert,
  deleteConcert,
  loadAllUsers,
  createUser,
  deleteUser,
} from '../lib/api';

export function AdminPage() {
  const { user } = useAuth();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // URL extraction state
  const [extractUrl, setExtractUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<ExtractedConcertData> | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [concertsData, usersData] = await Promise.all([
        loadAllConcerts(),
        loadAllUsers(),
      ]);
      setConcerts(concertsData.sort((a, b) => b.date.localeCompare(a.date)));
      setUsers(usersData);
    } catch (error) {
      console.error('Feil ved lasting:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExtractUrl() {
    if (!extractUrl.trim()) return;

    setExtracting(true);
    setExtractError(null);
    setFormSuccess(null);
    setFormError(null);

    try {
      const data = await extractConcertFromUrl(extractUrl.trim());
      setPrefillData(data);
    } catch (err) {
      setExtractError(
        err instanceof Error ? err.message : 'Kunne ikke hente info fra URL'
      );
    } finally {
      setExtracting(false);
    }
  }

  async function handleAddConcert(newConcert: any) {
    setFormError(null);
    setFormSuccess(null);

    try {
      const { status: _s, user_status: _us, ...concertData } = newConcert;
      await addConcert({ ...concertData, added_by: user!.id });
      setFormSuccess('Konsert lagt til!');
      setExtractUrl('');
      setPrefillData(undefined);
      await loadData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Kunne ikke legge til konsert');
    }
  }

  async function handleDeleteConcert(id: string) {
    try {
      await deleteConcert(id);
      setConcerts(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Feil ved sletting:', error);
    }
  }

  async function handleCreateUser(name: string, password: string) {
    await createUser(name, password, user!.id);
    await loadData();
  }

  async function handleDeleteUser(userId: string) {
    await deleteUser(userId, user!.id);
    setUsers(prev => prev.filter(u => u.id !== userId));
  }

  const inputClass =
    'w-full bg-white/10 text-white border border-white/20 px-4 py-3 text-sm ' +
    'placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-colors';

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white text-4xl font-black tracking-tight">
            KRX LIVE <span className="text-white/50 text-lg font-bold">ADMIN</span>
          </h1>
          <Link
            to="/"
            className="bg-white/20 text-white px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-white/30 transition-colors"
          >
            Tilbake
          </Link>
        </div>

        {/* User Management */}
        <section className="mb-12">
          <h2 className="text-white text-sm font-bold mb-4 uppercase tracking-widest">
            Brukere ({users.length})
          </h2>
          <UserForm onSubmit={handleCreateUser} />
          <div className="mt-4">
            <UserList
              users={users}
              currentUserId={user!.id}
              onDelete={handleDeleteUser}
            />
          </div>
        </section>

        {/* Add Concert */}
        <section className="mb-12">
          <h2 className="text-white text-sm font-bold mb-4 uppercase tracking-widest">
            Legg til konsert
          </h2>

          {/* URL extraction */}
          <div className="mb-6 space-y-2">
            <label className="block text-white/70 text-xs font-bold uppercase tracking-wide mb-1">
              Lim inn URL for auto-utfylling
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={extractUrl}
                onChange={(e) => setExtractUrl(e.target.value)}
                placeholder="https://vaktbua.no/events/..."
                className={inputClass}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleExtractUrl();
                  }
                }}
              />
              <button
                onClick={handleExtractUrl}
                disabled={extracting || !extractUrl.trim()}
                className="bg-white/20 text-white px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-white/30 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {extracting ? 'Henter...' : 'Hent info'}
              </button>
            </div>
            {extractError && (
              <div className="text-red-400 text-sm bg-red-400/10 px-4 py-2">
                {extractError}
              </div>
            )}
            {prefillData && !extractError && (
              <div className="text-green-400 text-sm bg-green-400/10 px-4 py-2">
                Info hentet! Sjekk og fyll ut eventuelle manglende felter nedenfor.
              </div>
            )}
          </div>

          <ConcertForm
            onSubmit={handleAddConcert}
            error={formError}
            success={formSuccess}
            initialData={prefillData}
          />
        </section>

        {/* All Concerts */}
        <section>
          <h2 className="text-white text-sm font-bold mb-4 uppercase tracking-widest">
            Alle konserter ({concerts.length})
          </h2>
          {loading ? (
            <div className="text-white/60 text-sm">Laster...</div>
          ) : (
            <AdminConcertList
              concerts={concerts}
              onDelete={handleDeleteConcert}
            />
          )}
        </section>
      </div>
    </div>
  );
}
