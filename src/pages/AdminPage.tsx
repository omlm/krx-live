import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Concert } from '../types/concert';
import { User } from '../types/user';
import { useAuth } from '../context/AuthContext';
import { ConcertList } from '../components/ConcertList';
import { Drawer } from '../components/Drawer';
import { UserForm } from '../components/UserForm';
import { UserList } from '../components/UserList';
import { TabButton } from '../components/TabButton';
import { ConcertFilters } from '../components/ConcertFilters';
import {
  loadAllConcerts,
  deleteConcert,
  updateConcert,
  loadAllUsers,
  createUser,
  deleteUser,
} from '../lib/api';
import styles from './AdminPage.module.css';

export function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'brukere' | 'konserter'>('brukere');
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const [genreFilter, setGenreFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');

  const filteredConcerts = concerts.filter((c) => {
    if (genreFilter && c.genre !== genreFilter) return false;
    if (venueFilter && c.venue !== venueFilter) return false;
    return true;
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [concertsData, usersData] = await Promise.all([
        loadAllConcerts(),
        loadAllUsers(),
      ]);
      setConcerts(concertsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Feil ved lasting:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditConcert(concertId: string, data: any) {
    await updateConcert(concertId, data);
    await loadData();
  }

  async function handleDeleteConcert(concertId: string) {
    await deleteConcert(concertId);
    await loadData();
  }

  async function handleCreateUser(name: string, password: string) {
    await createUser(name, password, user!.id);
    await loadData();
  }

  async function handleDeleteUser(userId: string) {
    await deleteUser(userId, user!.id);
    setUsers(prev => prev.filter(u => u.id !== userId));
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>
              KRX LIVE <span className={styles.titleAdmin}>ADMIN</span>
            </h1>
            <Link to="/" className={styles.backLink}>
              Tilbake
            </Link>
          </div>
        </header>

        {/* Tabs */}
        <div className={styles.tabs}>
          <div className={styles.tabRow}>
            <TabButton
              active={activeTab === 'brukere'}
              onClick={() => setActiveTab('brukere')}
            >
              Brukere
            </TabButton>
            <TabButton
              active={activeTab === 'konserter'}
              onClick={() => setActiveTab('konserter')}
            >
              Konserter
            </TabButton>
          </div>
        </div>

        {/* Brukere tab */}
        {activeTab === 'brukere' && (
          <section className={styles.section}>
            <button
              onClick={() => setShowUserDrawer(true)}
              className={styles.newUserBtn}
            >
              Ny bruker
            </button>
            <UserList
              users={users}
              currentUserId={user!.id}
              onDelete={handleDeleteUser}
            />
          </section>
        )}

        {/* Konserter tab */}
        {activeTab === 'konserter' && (
          <section>
            <ConcertFilters
              concerts={concerts}
              genreFilter={genreFilter}
              venueFilter={venueFilter}
              onGenreChange={setGenreFilter}
              onVenueChange={setVenueFilter}
            />
            {loading ? (
              <div className={styles.loading}>Laster...</div>
            ) : (
              <ConcertList
                concerts={filteredConcerts}
                onEdit={handleEditConcert}
                onDelete={handleDeleteConcert}
                isAdmin={true}
              />
            )}
          </section>
        )}
      </div>

      {/* User drawer */}
      <Drawer
        open={showUserDrawer}
        onClose={() => setShowUserDrawer(false)}
        title="Ny bruker"
      >
        <UserForm onSubmit={handleCreateUser} />
      </Drawer>
    </div>
  );
}
