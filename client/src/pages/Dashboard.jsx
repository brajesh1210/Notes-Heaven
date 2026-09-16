import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, FolderOpen, Clock, ArrowRight, Pin, Star, Sparkles } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import StatCard from '../components/notes/StatCard.jsx';
import NoteRow from '../components/notes/NoteRow.jsx';
import { SkeletonList, SkeletonStats } from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { friendlyDate, greeting, pluralize } from '../lib/utils.js';

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, n] = await Promise.all([api.get('/notes/stats/dashboard'), api.get('/notes', { limit: 6, sort: '-updatedAt' })]);
      setStats(s.data);
      setNotes(n.data.notes || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${firstName}! 👋`}
        subtitle="Keep going! Your notes are your superpower."
        actions={
          <Button icon={Plus} onClick={() => navigate('/notes/new')}>
            New Note
          </Button>
        }
      />

      {/* stats */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={FileText}
            label="Total Notes"
            value={stats?.totalNotes ?? 0}
            tone="brand"
            hint={stats?.createdToday ? `${pluralize(stats.createdToday, 'note')} today` : undefined}
          />
          <StatCard icon={FolderOpen} label="Folders" value={stats?.folders ?? 0} tone="emerald" hint={stats?.tags ? `${stats.tags} tags` : undefined} />
          <StatCard
            icon={Clock}
            label="Last Updated"
            value={stats?.lastUpdated ? friendlyDate(stats.lastUpdated) : '—'}
            tone="violet"
            hint={stats?.trashCount ? `${stats.trashCount} in trash` : 'Trash khaali hai'}
          />
        </div>
      )}

      {/* quick chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/notes?favorite=true" className="chip-muted hover:bg-brand-50 hover:text-brand-700">
          <Star size={12} /> Favorites {stats?.favorite ? `(${stats.favorite})` : ''}
        </Link>
        <Link to="/notes?pinned=true" className="chip-muted hover:bg-brand-50 hover:text-brand-700">
          <Pin size={12} /> Pinned {stats?.pinned ? `(${stats.pinned})` : ''}
        </Link>
        <Link to="/trash" className="chip-muted hover:bg-brand-50 hover:text-brand-700">
          🗑️ Trash {stats?.trashCount ? `(${stats.trashCount})` : ''}
        </Link>
      </div>

      {/* recent notes */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-ink">Recent Notes</h2>
          <Link to="/notes" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <SkeletonList rows={4} />
        ) : notes.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Abhi koi note nahi hai"
            description="Pehla note likho - title, content, folder aur tags ke saath. Baad me search aur export bhi kar sakoge."
            action={
              <Button icon={Plus} onClick={() => navigate('/notes/new')}>
                Create your first note
              </Button>
            }
          />
        ) : (
          <div className="space-y-1.5">
            {notes.map((n) => (
              <NoteRow key={n.id} note={n} onChanged={load} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
