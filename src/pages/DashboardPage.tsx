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
import { ConcertFilters } from '../components/ConcertFilters';
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
import styles from './DashboardPage.module.css';

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
  const [genreFilter, setGenreFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
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

  const baseConcerts = activeTab === 'mine' ? myConcerts : allConcerts;
  const displayConcerts = baseConcerts.filter((c) => {
    if (genreFilter && c.genre !== genreFilter) return false;
    if (venueFilter && c.venue !== venueFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Laster...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Background image with overlay */}
      <div
        className={styles.bgImage}
        style={{
          backgroundImage: 'url(/bg.jpg)',
          backgroundPosition: 'center 20%',
        }}
      />
      <div className={styles.bgOverlay} />

      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>KRX LIVE</h1>
            <button
              onClick={() => setShowForm(true)}
              className={styles.newConcertBtn}
            >
              Ny konsert
            </button>
          </div>
        </header>

        {formSuccess && !showForm && (
          <div className={styles.successBanner}>
            <div className="alert-success">{formSuccess}</div>
          </div>
        )}

        {/* Invitations */}
        {invitations.length > 0 && (
          <div className={styles.invitationsSection}>
            <h2 className={styles.invitationsHeading}>
              Invitasjoner ({invitations.length})
            </h2>
            <div className={styles.invitationsList}>
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
        <div className={styles.tabs}>
          <div className={styles.tabRow}>
            <TabButton
              active={activeTab === 'mine'}
              onClick={() => { setActiveTab('mine'); setGenreFilter(''); setVenueFilter(''); }}
            >
              MINE KONSERTER
            </TabButton>
            <TabButton
              active={activeTab === 'alle'}
              onClick={() => { setActiveTab('alle'); setGenreFilter(''); setVenueFilter(''); }}
            >
              ALLE
            </TabButton>
          </div>
        </div>

        {/* Filters */}
        <ConcertFilters
          concerts={baseConcerts}
          genreFilter={genreFilter}
          venueFilter={venueFilter}
          onGenreChange={setGenreFilter}
          onVenueChange={setVenueFilter}
        />

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
        <footer className={styles.footer}>
          <button onClick={logout} className={styles.footerBtn}>
            Logg ut
          </button>
          {user?.is_admin && (
            <Link to="/admin" className={styles.footerLink}>
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
