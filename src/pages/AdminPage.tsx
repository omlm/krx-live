import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Concert } from '../types/concert';
import { User } from '../types/user';
import { useAuth } from '../context/AuthContext';
import { ConcertList } from '../components/ConcertList';
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight min-w-0">
            KRX LIVE <span className="text-white/50 text-base sm:text-lg font-bold">ADMIN</span>
          </h1>
          <Link
            to="/"
            className="bg-white/20 text-white px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-white/30 transition-colors shrink-0"
          >
            Tilbake
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 rounded-full overflow-hidden">
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
          <section>
            <UserForm onSubmit={handleCreateUser} />
            <div className="mt-4">
              <UserList
                users={users}
                currentUserId={user!.id}
                onDelete={handleDeleteUser}
              />
            </div>
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
    </div>
  );
}
