import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Concert } from './types/concert';
import { ConcertList } from './components/ConcertList';
import { TabButton } from './components/TabButton';
import { mockConcerts } from './lib/mockData';
import { supabase } from './lib/supabase';

function App() {
  const [activeTab, setActiveTab] = useState<'going' | 'interested'>('going');
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConcerts();
  }, []);

  async function loadConcerts() {
    try {
      const { data, error } = await supabase
        .from('concerts')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setConcerts(data);
      } else {
        // Fallback til mock data hvis databasen er tom
        setConcerts(mockConcerts);
      }
    } catch (error) {
      console.error('Feil ved lasting av konserter:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredConcerts = concerts;

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

      {/* Innhold */}
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-8 pb-6 px-4 flex items-baseline justify-between gap-2">
          <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight">
            KRX LIVE
          </h1>
          <Link
            to="/admin"
            className="text-white/30 text-xs font-bold uppercase tracking-wide hover:text-white/60 transition-colors"
          >
            Admin
          </Link>
        </header>

        {/* Tabs */}
        <div className="px-4 mb-6">
          <div className="flex gap-2 rounded-full overflow-hidden">
            <TabButton
              active={activeTab === 'going'}
              onClick={() => setActiveTab('going')}
            >
              MINE KONSERTER
            </TabButton>
            <TabButton
              active={activeTab === 'interested'}
              onClick={() => setActiveTab('interested')}
            >
              ALLE
            </TabButton>
          </div>
        </div>

        {/* Concert List */}
        <ConcertList concerts={filteredConcerts} />
      </div>
    </div>
  );
}

export default App;
