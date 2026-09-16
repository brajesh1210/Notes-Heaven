import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, FolderOpen, Star, Pin } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import NotesTable from '../components/notes/NotesTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SearchBar from '../components/layout/SearchBar.jsx';
import { SkeletonList } from '../components/ui/Spinner.jsx';
import { api } from '../lib/api.js';
import { useFolders } from '../context/FoldersContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { cn } from '../lib/utils.js';

/** Search Results page (design 9) - query + filters + results */
const SearchResults = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { folders } = useFolders();

  const q = params.get('q') || '';
  const folder = params.get('folder') || '';
  const tags = params.get('tags') || '';
  const favorite = params.get('favorite') === 'true';
  const pinned = params.get('pinned') === 'true';
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const trashed = params.get('trashed') === 'true';
  const sort = params.get('sort') || 'recent';

  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/search', {
        q,
        folder: folder || undefined,
        tags: tags || undefined,
        favorite: favorite ? 'true' : undefined,
        pinned: pinned ? 'true' : undefined,
        from: from || undefined,
        to: to || undefined,
        trashed: trashed ? 'true' : undefined,
        sort,
        limit: 60,
      });
      setNotes(data.notes || []);
      setTotal(data.total || 0);
    } catch (e) {
      toast.error(e.message);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [q, folder, tags, favorite, pinned, from, to, trashed, sort, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const activeFilters = [folder, tags, from, to].filter(Boolean).length + (favorite ? 1 : 0) + (pinned ? 1 : 0);

  return (
    <div>
      <PageHeader
        title={q ? `Search Results for "${q}"` : 'Search'}
        subtitle={loading ? 'Dhundh rahe hain...' : `${total} result${total === 1 ? '' : 's'}`}
        actions={
          <Button
            variant="outline"
            icon={SlidersHorizontal}
            onClick={() => setShowFilters((s) => !s)}
            className={cn(activeFilters && 'border-brand-300 bg-brand-50 text-brand-700')}
          >
            Filters{activeFilters ? ` (${activeFilters})` : ''}
          </Button>
        }
      />

      <div className="mb-4">
        <SearchBar initialValue={q} />
      </div>

      {showFilters && (
        <div className="card mb-4 space-y-4 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label" htmlFor="f-folder">
                Folder
              </label>
              <select id="f-folder" className="input bg-white" value={folder} onChange={(e) => setParam('folder', e.target.value)}>
                <option value="">All folders</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.breadcrumb || f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="f-tags">
                Tags (comma separated)
              </label>
              <input id="f-tags" className="input" placeholder="physics, important" value={tags} onChange={(e) => setParam('tags', e.target.value)} />
            </div>

            <div>
              <label className="label" htmlFor="f-from">
                Edited from
              </label>
              <input id="f-from" type="date" className="input" value={from} onChange={(e) => setParam('from', e.target.value)} />
            </div>

            <div>
              <label className="label" htmlFor="f-to">
                Edited till
              </label>
              <input id="f-to" type="date" className="input" value={to} onChange={(e) => setParam('to', e.target.value)} />
            </div>

            <div>
              <label className="label" htmlFor="f-sort">
                Sort
              </label>
              <select id="f-sort" className="input bg-white" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
                <option value="recent">Recently edited</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title (A-Z)</option>
                <option value="created">Recently created</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setParam('favorite', favorite ? '' : 'true')} className={cn('chip-muted hover:bg-brand-50 hover:text-brand-700', favorite && 'bg-amber-50 text-amber-700')}>
              <Star size={12} /> Favorites
            </button>
            <button onClick={() => setParam('pinned', pinned ? '' : 'true')} className={cn('chip-muted hover:bg-brand-50 hover:text-brand-700', pinned && 'bg-brand-50 text-brand-700')}>
              <Pin size={12} /> Pinned
            </button>
            <button onClick={() => setParam('trashed', trashed ? '' : 'true')} className={cn('chip-muted hover:bg-brand-50 hover:text-brand-700', trashed && 'bg-red-50 text-red-600')}>
              <FolderOpen size={12} /> Include trash
            </button>
            {activeFilters > 0 && (
              <button onClick={() => setParams({ q }, { replace: true })} className="chip-muted hover:bg-slate-200">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonList rows={5} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={Search}
          title={q ? `"${q}" ke liye kuch nahi mila` : 'Search karo'}
          description="Dusre keyword se try karo - title, content, tag ya folder naam se search kar sakte ho."
          action={
            <Button variant="outline" onClick={() => navigate('/notes')}>
              Saare notes dekho
            </Button>
          }
        />
      ) : (
        <NotesTable notes={notes} onChanged={load} />
      )}
    </div>
  );
};

export default SearchResults;
