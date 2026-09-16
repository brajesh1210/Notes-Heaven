import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, FileText, Star, Pin, Filter, LayoutGrid, Table2, CheckSquare, XSquare } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import { IconButton } from '../components/ui/Button.jsx';
import NotesTable from '../components/notes/NotesTable.jsx';
import NoteActionsMenu from '../components/notes/NoteActionsMenu.jsx';
import BulkBar from '../components/notes/BulkBar.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonList } from '../components/ui/Spinner.jsx';
import TagInput from '../components/notes/TagInput.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { SORT_OPTIONS } from '../lib/constants.js';
import { cn, timeAgo } from '../lib/utils.js';

/** All Notes page - table or grid view, sortable columns, bulk selection */
const AllNotes = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [view, setView] = useState(() => localStorage.getItem('nh-notes-view') || 'table');

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

  const changeView = (v) => {
    setView(v);
    localStorage.setItem('nh-notes-view', v);
  };

  const onSort = (field) => {
    if (field === 'title') setParam('sort', sort === 'title' ? '-title' : 'title');
    else setParam('sort', sort === '-updatedAt' ? 'updatedAt' : '-updatedAt');
  };

  const toggleSelect = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = (checked) => setSelected(checked ? notes.map((n) => n.id) : []);
  const exitSelection = () => {
    setSelected([]);
    setSelectMode(false);
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
            <div className="flex overflow-hidden rounded-[10px] border border-line">
              <button
                onClick={() => changeView('table')}
                className={cn('p-2 transition', view === 'table' ? 'bg-brand-50 text-brand-700' : 'text-ink-muted hover:bg-slate-50')}
                aria-label="Table view"
              >
                <Table2 size={16} />
              </button>
              <button
                onClick={() => changeView('grid')}
                className={cn('p-2 transition', view === 'grid' ? 'bg-brand-50 text-brand-700' : 'text-ink-muted hover:bg-slate-50')}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <Button
              variant="outline"
              icon={selectMode ? XSquare : CheckSquare}
              onClick={() => (selectMode ? exitSelection() : setSelectMode(true))}
              className={cn(selectMode && 'border-brand-300 bg-brand-50 text-brand-700')}
            >
              Select
            </Button>
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
      ) : view === 'grid' ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div key={note.id} className={cn('card card-hover relative p-4', selected.includes(note.id) && 'ring-2 ring-brand-300')}>
              {selectMode && (
                <input
                  type="checkbox"
                  className="checkbox absolute right-3.5 top-3.5"
                  checked={selected.includes(note.id)}
                  onChange={() => toggleSelect(note.id)}
                  aria-label={`Select ${note.title}`}
                />
              )}
              <Link to={`/notes/${note.id}`} className="block pr-6">
                <p className="flex items-center gap-1.5 truncate text-[14.5px] font-semibold text-ink">
                  {note.title}
                  {note.isPinned && <Pin size={13} className="shrink-0 text-brand-600" />}
                  {note.isFavorite && <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />}
                </p>
                <p className="clamp-2 mt-1.5 min-h-[36px] text-[12.5px] leading-relaxed text-ink-muted">{note.snippet || 'No content yet.'}</p>
              </Link>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11.5px] text-ink-soft">
                  {note.folder?.name || 'Uncategorized'} · {timeAgo(note.lastEditedAt)}
                </span>
                <NoteActionsMenu note={note} onChanged={load} onRemoved={load} showOpen={false} size={16} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <NotesTable
          notes={notes}
          onChanged={load}
          selectable={selectMode}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          sort={sort}
          onSort={onSort}
        />
      )}

      {selectMode && selected.length > 0 && (
        <BulkBar
          ids={selected}
          onDone={() => {
            exitSelection();
            load();
          }}
        />
      )}
    </div>
  );
};

export default AllNotes;
