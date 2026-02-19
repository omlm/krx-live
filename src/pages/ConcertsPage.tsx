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
import styles from './ConcertsPage.module.css';

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
      <div className={styles.loading}>
        <div className={styles.loadingText}>Laster...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.headerRow}>
          <h1 className={styles.title}>
            KRX LIVE <span className={styles.titleSub}>KONSERTER</span>
          </h1>
          <Link to="/" className={styles.backLink}>
            Tilbake
          </Link>
        </div>

        {/* Add concert toggle */}
        <div className={styles.toggleRow}>
          <button
            onClick={() => setShowForm(!showForm)}
            className={styles.toggleBtn}
          >
            {showForm ? 'Avbryt' : '+ Legg til konsert'}
          </button>
        </div>

        {showForm && (
          <div className={styles.formWrapper}>
            <ConcertForm
              onSubmit={handleAddConcert}
              error={formError}
              success={formSuccess}
            />
          </div>
        )}

        {formSuccess && !showForm && (
          <div className={styles.successBanner}>
            <div className="alert-success">{formSuccess}</div>
          </div>
        )}

        {/* All concerts grouped by date */}
        {Object.entries(groupedConcerts).map(([dateLabel, dateConcerts]) => (
          <div key={dateLabel} className={styles.dateGroup}>
            <h2 className={styles.dateHeading}>{dateLabel}</h2>
            <div className={styles.dateItems}>
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
          <div className={styles.empty}>
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
