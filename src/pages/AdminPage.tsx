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
import {
  loadAllConcerts,
  deleteConcert,
  updateConcert,
  loadAllUsers,
  createUser,
  deleteUser,
} from '../lib/api';

export function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'brukere' | 'konserter'>('brukere');
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserDrawer, setShowUserDrawer] = useState(false);

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
    <div className="min-h-screen bg-black">
      <div className="max-w-[600px] mx-auto">
        <header className="pt-8 pb-4 px-4">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight">
              KRX LIVE <span className="text-white/75">ADMIN</span>
            </h1>
            <Link
              to="/"
              className="px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors shrink-0 bg-white/20 text-white hover:bg-white/30"
            >
              Tilbake
            </Link>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-4 mb-6">
          <div className="flex gap-2">
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
          <section className="px-4">
            <button
              onClick={() => setShowUserDrawer(true)}
              className="mb-4 px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors bg-green-500/30 text-green-400 hover:bg-green-500/40"
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
            {loading ? (
              <div className="text-white/60 text-sm">Laster...</div>
            ) : (
              <ConcertList
                concerts={concerts}
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
