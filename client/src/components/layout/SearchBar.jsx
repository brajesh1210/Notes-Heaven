import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Folder, Tag, Loader2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { cn, timeAgo } from '../../lib/utils.js';

const TYPE_ICON = { note: FileText, folder: Folder, tag: Tag };

/** Topbar search - instant suggestions, Enter opens the Search Results page */
const SearchBar = ({ className, autoFocus = false, initialValue = '', onNavigate }) => {
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const boxRef = useRef(null);
  const navigate = useNavigate();
  const debounced = useDebounce(value, 250);

  useEffect(() => {
    let alive = true;
    if (!debounced.trim()) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        alive = false;
      };
    }
    setLoading(true);
    api
      .get('/search/suggestions', { q: debounced.trim() })
      .then(({ data }) => alive && setSuggestions(data.suggestions || []))
      .catch(() => alive && setSuggestions([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [debounced]);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const goToResults = (q = value) => {
    if (!q.trim()) return;
    setOpen(false);
    onNavigate?.();
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const pick = (s) => {
    setOpen(false);
    onNavigate?.();
    if (s.type === 'note') navigate(`/notes/${s.id}`);
    else if (s.type === 'folder') navigate(`/folders/${s.id}`);
    else navigate(`/search?q=${encodeURIComponent(s.label)}`);
  };

  return (
    <div ref={boxRef} className={cn('relative w-full', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToResults();
        }}
        role="search"
      >
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search notes, folders..."
          aria-label="Search notes"
          className="h-10 w-full rounded-[10px] border border-line bg-white pl-10 pr-9 text-sm text-ink placeholder:text-ink-soft transition focus:border-brand-500 focus:outline-none focus:shadow-focus"
        />

        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue('');
              setSuggestions([]);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-soft transition hover:bg-slate-100 hover:text-ink"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        ) : null}
      </form>

      {open && value.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-pop animate-fade-in">
          {loading && suggestions.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-ink-muted">
              <Loader2 size={15} className="animate-spin" /> Searching...
            </div>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-muted">No matches for "{value}".</p>
          ) : (
            <>
              {suggestions.map((s) => {
                const Icon = TYPE_ICON[s.type] || FileText;
                return (
                  <button
                    key={`${s.type}-${s.id}`}
                    onClick={() => pick(s)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50"
                  >
                    <Icon size={15} className="shrink-0 text-ink-soft" style={s.color ? { color: s.color } : undefined} />
                    <span className="flex-1 truncate text-[13.5px] font-medium text-ink">{s.label}</span>
                    <span className="shrink-0 text-[11px] uppercase tracking-wide text-ink-soft">{s.type}</span>
                    {s.updatedAt && <span className="shrink-0 text-[11px] text-ink-soft">{timeAgo(s.updatedAt)}</span>}
                  </button>
                );
              })}
              <div className="my-1 h-px bg-line" />
              <button onClick={() => goToResults()} className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-brand-700 transition hover:bg-brand-50">
                Saare results dekho "{value}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
