import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Concert, ConcertStatus } from '../types/concert';
import { User } from '../types/user';
import { InviteModal } from '../components/InviteModal';
import { ConcertExpandCard } from '../components/ConcertExpandCard';
import { ConcertForm } from '../components/ConcertForm';
import { groupConcertsByDate } from '../lib/dateUtils';
import {
  loadAllConcerts,
  getUserConcertStatuses,
  setUserConcertStatus,
  addConcert,
  sendInvitation,
  loadAllUsers,
} from '../lib/api';

export function ConcertsPage() {
  const { user } = useAuth();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ConcertStatus>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [inviteConcertId, setInviteConcertId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [concertsData, statusData, usersData] = await Promise.all([
        loadAllConcerts(),
        getUserConcertStatuses(user!.id),
        loadAllUsers(),
      ]);
      setConcerts(concertsData);
      setStatuses(statusData);
      setUsers(usersData.filter(u => u.id !== user!.id));
    } catch (error) {
      console.error('Feil ved lasting:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(concertId: string, status: ConcertStatus | null) {
    try {
      await setUserConcertStatus(user!.id, concertId, status);
      if (status === null) {
        const newStatuses = { ...statuses };
        delete newStatuses[concertId];
        setStatuses(newStatuses);
      } else {
        setStatuses(prev => ({ ...prev, [concertId]: status }));
      }
    } catch (error) {
      console.error('Feil ved endring av status:', error);
    }
  }

  async function handleAddConcert(data: any) {
    setFormError(null);
    setFormSuccess(null);
    try {
      const { status: _s, user_status: _us, ...concertData } = data;
      const newConcert = await addConcert({ ...concertData, added_by: user!.id });
      await setUserConcertStatus(user!.id, newConcert.id, 'going');
      setFormSuccess('Konsert lagt til!');
      setShowForm(false);
      await loadData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Kunne ikke legge til konsert');
    }
  }

  async function handleInvite(toUserId: string) {
    if (!inviteConcertId) return;
    await sendInvitation(user!.id, toUserId, inviteConcertId);
  }

  const groupedConcerts = groupConcertsByDate(concerts);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Laster...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight min-w-0">
            KRX LIVE <span className="text-white/50 text-base sm:text-lg font-bold">KONSERTER</span>
          </h1>
          <Link
            to="/"
            className="bg-white/20 text-white px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-white/30 transition-colors shrink-0"
          >
            Tilbake
          </Link>
        </div>

        {/* Add concert toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white/20 text-white px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-white/30 transition-colors"
          >
            {showForm ? 'Avbryt' : '+ Legg til konsert'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <ConcertForm
              onSubmit={handleAddConcert}
              error={formError}
              success={formSuccess}
            />
          </div>
        )}

        {formSuccess && !showForm && (
          <div className="text-green-400 text-sm bg-green-400/10 px-4 py-2 mb-6">
            {formSuccess}
          </div>
        )}

        {/* All concerts grouped by date */}
        {Object.entries(groupedConcerts).map(([dateLabel, dateConcerts]) => (
          <div key={dateLabel} className="mb-6">
            <h2 className="text-white text-sm font-bold mb-3 uppercase tracking-widest px-0">
              {dateLabel}
            </h2>
            <div className="space-y-1">
              {dateConcerts.map((concert: Concert) => (
                <ConcertExpandCard
                  key={concert.id}
                  concert={concert}
                  status={statuses[concert.id] || null}
                  onStatusChange={handleStatusChange}
                  onInvite={(id) => setInviteConcertId(id)}
                />
              ))}
            </div>
          </div>
        ))}

        {concerts.length === 0 && (
          <div className="text-white/40 text-sm text-center py-12">
            Ingen konserter lagt til enda.
          </div>
        )}
      </div>

      {/* Invite modal */}
      {inviteConcertId && (
        <InviteModal
          users={users}
          onInvite={handleInvite}
          onClose={() => setInviteConcertId(null)}
        />
      )}
    </div>
  );
}
