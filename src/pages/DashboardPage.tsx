import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Concert, ConcertStatus } from '../types/concert';
import { Invitation, SentInvitation, User } from '../types/user';
import { ConcertList } from '../components/ConcertList';
import { ConcertDrawer } from '../components/ConcertDrawer';
import { TabButton } from '../components/TabButton';
import { InvitationCard } from '../components/InvitationCard';
import { InviteModal } from '../components/InviteModal';
import {
  loadUserConcerts,
  loadAllConcerts,
  getUserConcertStatuses,
  setUserConcertStatus,
  loadPendingInvitations,
  respondToInvitation,
  sendInvitation,
  loadAllUsers,
  addConcert,
  loadSentInvitations,
} from '../lib/api';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'mine' | 'alle'>('mine');
  const [myConcerts, setMyConcerts] = useState<Concert[]>([]);
  const [allConcerts, setAllConcerts] = useState<Concert[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ConcertStatus>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<SentInvitation[]>([]);
  const [inviteConcertId, setInviteConcertId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      const [myData, allData, statusData, invData, sentData, usersData] = await Promise.all([
        loadUserConcerts(user!.id),
        loadAllConcerts(),
        getUserConcertStatuses(user!.id),
        loadPendingInvitations(user!.id),
        loadSentInvitations(user!.id),
        loadAllUsers(),
      ]);
      setMyConcerts(myData);
      setAllConcerts(allData);
      setStatuses(statusData);
      setInvitations(invData);
      setSentInvitations(sentData);
      setUsers(usersData.filter(u => u.id !== user!.id));
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
      await loadData();
    } catch (error) {
      console.error('Feil ved svar på invitasjon:', error);
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
      // Reload my concerts to reflect changes
      const myData = await loadUserConcerts(user!.id);
      setMyConcerts(myData);
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
    const sentData = await loadSentInvitations(user!.id);
    setSentInvitations(sentData);
  }

  const displayConcerts = activeTab === 'mine' ? myConcerts : allConcerts;

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
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: 'url(/bg.jpg)',
          backgroundPosition: 'center 20%',
        }}
      />
      <div className="fixed inset-0 bg-black/50" />

      <div className="relative z-10 max-w-[600px] mx-auto">
        {/* Header */}
        <header className="pt-8 pb-4 px-4">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight">
              KRX LIVE
            </h1>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors shrink-0 bg-green-500/30 text-green-400 hover:bg-green-500/40"
            >
              Ny konsert
            </button>
          </div>
        </header>

        {formSuccess && !showForm && (
          <div className="px-4 mb-6">
            <div className="text-green-400 text-sm bg-green-400/10 px-4 py-2">
              {formSuccess}
            </div>
          </div>
        )}

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
          <div className="flex gap-2">
            <TabButton
              active={activeTab === 'mine'}
              onClick={() => setActiveTab('mine')}
            >
              MINE KONSERTER
            </TabButton>
            <TabButton
              active={activeTab === 'alle'}
              onClick={() => setActiveTab('alle')}
            >
              ALLE
            </TabButton>
          </div>
        </div>

        {/* Concert List */}
        <ConcertList
          concerts={displayConcerts}
          statuses={statuses}
          sentInvitations={sentInvitations}
          onStatusChange={handleStatusChange}
          onInvite={(id) => setInviteConcertId(id)}
          resetKey={activeTab}
        />

        {/* Footer */}
        <footer className="px-4 py-8 flex items-center justify-center gap-4">
          <button
            onClick={logout}
            className="text-white/30 text-xs uppercase tracking-wide hover:text-white/60 transition-colors"
          >
            Logg ut
          </button>
          {user?.is_admin && (
            <Link
              to="/admin"
              className="text-white/30 text-xs uppercase tracking-wide hover:text-white/60 transition-colors"
            >
              Admin
            </Link>
          )}
        </footer>
      </div>

      {/* Concert drawer */}
      <ConcertDrawer
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddConcert}
        error={formError}
        success={formSuccess}
      />

      {/* Invite modal */}
      {inviteConcertId && (
        <InviteModal
          users={users}
          sentInvitations={sentInvitations.filter(inv => inv.concert_id === inviteConcertId)}
          onInvite={handleInvite}
          onClose={() => setInviteConcertId(null)}
        />
      )}
    </div>
  );
}
