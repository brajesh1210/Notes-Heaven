import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, FileText, Star, Pin, Filter } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import NotesTable from '../components/notes/NotesTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonList } from '../components/ui/Spinner.jsx';
import TagInput from '../components/notes/TagInput.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { SORT_OPTIONS } from '../lib/constants.js';
import { cn } from '../lib/utils.js';

/** All Notes page (design: table view - Title | Folder | Last Modified) */
const AllNotes = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const sort = params.get('sort') || '-updatedAt';
  const favorite = params.get('favorite') === 'true';
  const pinned = params.get('pinned') === 'true';
  const tagsParam = params.get('tags') || '';
  const activeTags = tagsParam.split(',').filter(Boolean);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notes', {
        sort,
        limit: 100,
        favorite: favorite ? 'true' : undefined,
        pinned: pinned ? 'true' : undefined,
      });

      let list = data.notes || [];

      // tag filter (client side - simple and fast)
      if (activeTags.length) {
        list = list.filter((n) => (n.tags || []).some((t) => activeTags.includes(t.name)));
      }

      setNotes(list);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, favorite, pinned, tagsParam, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === null || value === '' || value === false) next.delete(key);
    else next.set(key, String(value));
    setParams(next, { replace: true });
  };

  const title = favorite ? 'Favorite Notes' : pinned ? 'Pinned Notes' : 'All Notes';
  const activeFilters = (favorite ? 1 : 0) + (pinned ? 1 : 0) + activeTags.length;

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={`${notes.length} note${notes.length === 1 ? '' : 's'}${activeFilters ? ' (filtered)' : ''}`}
        actions={
          <>
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters((s) => !s)}
              className={cn(activeFilters && 'border-brand-300 bg-brand-50 text-brand-700')}
            >
              Filters{activeFilters ? ` (${activeFilters})` : ''}
            </Button>
            <Button icon={Plus} onClick={() => navigate('/notes/new')}>
              New Note
            </Button>
          </>
        }
      />

      {/* filter bar */}
      {showFilters && (
        <div className="card mb-4 space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setParam('favorite', favorite ? null : 'true')}
              className={cn('chip-muted transition hover:bg-brand-50 hover:text-brand-700', favorite && 'bg-amber-50 text-amber-700')}
            >
              <Star size={12} className={favorite ? 'fill-amber-400 text-amber-400' : ''} /> Favorites only
            </button>
            <button
              onClick={() => setParam('pinned', pinned ? null : 'true')}
              className={cn('chip-muted transition hover:bg-brand-50 hover:text-brand-700', pinned && 'bg-brand-50 text-brand-700')}
            >
              <Pin size={12} /> Pinned only
            </button>
            <button
              onClick={() => {
                const next = new URLSearchParams();
                setParams(next, { replace: true });
              }}
              className="chip-muted transition hover:bg-slate-200"
            >
              Clear all
            </button>
          </div>

          <div>
            <p className="label">Filter by tag</p>
            <TagInput value={activeTags} allTags={allTags} onTagsLoaded={setAllTags} onChange={(tags) => setParam('tags', tags.join(','))} />
          </div>

          <div className="max-w-[240px]">
            <label className="label" htmlFor="sort">
              Sort by
            </label>
            <select id="sort" value={sort} onChange={(e) => setParam('sort', e.target.value)} className="input bg-white">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonList rows={6} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={activeFilters ? 'No notes match these filters' : 'No notes yet'}
          description={
            activeFilters ? 'Try removing some filters.' : 'Create your first note - with folders, tags and rich content.'
          }
          action={
            activeFilters ? (
              <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </Button>
            ) : (
              <Button icon={Plus} onClick={() => navigate('/notes/new')}>
                Create note
              </Button>
            )
          }
        />
      ) : (
        <NotesTable notes={notes} onChanged={load} />
      )}
    </div>
  );
};

export default AllNotes;
