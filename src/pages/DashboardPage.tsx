import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Concert, ConcertStatus } from '../types/concert';
import { Invitation } from '../types/user';
import { ConcertList } from '../components/ConcertList';
import { TabButton } from '../components/TabButton';
import { InvitationCard } from '../components/InvitationCard';
import { loadUserConcerts, loadPendingInvitations, respondToInvitation } from '../lib/api';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ConcertStatus>('going');
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      const [concertsData, invitationsData] = await Promise.all([
        loadUserConcerts(user!.id),
        loadPendingInvitations(user!.id),
      ]);
      setConcerts(concertsData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Feil ved lasting:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRespondInvitation(
    invitationId: string,
    response: 'accepted' | 'declined',
    concertId: string
  ) {
    try {
      await respondToInvitation(invitationId, response, user!.id, concertId);
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Feil ved svar på invitasjon:', error);
    }
  }

  const filteredConcerts = concerts.filter(
    (concert) => concert.user_status === activeTab
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Laster...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Bakgrunnsbilde med overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1501612780327-45045538702b?w=1200)',
        }}
      />
      <div className="fixed inset-0 bg-black/50" />

      <div className="relative z-10">
        {/* Header */}
        <header className="pt-8 pb-4 px-4">
          <div className="flex items-baseline justify-between mb-1">
            <h1 className="text-white text-5xl font-black tracking-tight">
              KRX LIVE
            </h1>
            <div className="flex items-center gap-3">
              <Link
                to="/concerts"
                className="text-white/50 text-xs font-bold uppercase tracking-wide hover:text-white/80 transition-colors"
              >
                Alle konserter
              </Link>
              {user?.is_admin && (
                <Link
                  to="/admin"
                  className="text-white/30 text-xs font-bold uppercase tracking-wide hover:text-white/60 transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs uppercase tracking-widest">
              Hei, {user?.name}
            </span>
            <button
              onClick={logout}
              className="text-white/30 text-xs uppercase tracking-wide hover:text-white/60 transition-colors"
            >
              Logg ut
            </button>
          </div>
        </header>

        {/* Invitations */}
        {invitations.length > 0 && (
          <div className="px-4 mb-6">
            <h2 className="text-white text-sm font-bold mb-3 uppercase tracking-widest">
              Invitasjoner ({invitations.length})
            </h2>
            <div className="space-y-2">
              {invitations.map((inv) => (
                <InvitationCard
                  key={inv.id}
                  invitation={inv}
                  onRespond={handleRespondInvitation}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-4 mb-6">
          <div className="flex gap-2 rounded-full overflow-hidden">
            <TabButton
              active={activeTab === 'going'}
              onClick={() => setActiveTab('going')}
            >
              SKAL GÅ PÅ
            </TabButton>
            <TabButton
              active={activeTab === 'interested'}
              onClick={() => setActiveTab('interested')}
            >
              KANSKJE GÅ PÅ
            </TabButton>
          </div>
        </div>

        {/* Concert List */}
        <ConcertList concerts={filteredConcerts} />
      </div>
    </div>
  );
}
