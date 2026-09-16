import { Link } from 'react-router-dom';
import { FileText, Pin, Star } from 'lucide-react';
import { timeAgo } from '../../lib/utils.js';
import NoteActionsMenu from './NoteActionsMenu.jsx';

/** Clickable column header that toggles ascending/descending sort */
const SortHead = ({ label, field, sort, onSort }) => {
  if (!onSort) return <span className="table-head">{label}</span>;
  const active = sort && sort.replace('-', '') === field;
  const desc = active && sort.startsWith('-');
  return (
    <button type="button" onClick={() => onSort(field)} className="table-head inline-flex items-center gap-1 transition hover:text-ink">
      {label}
      <span className={`text-[10px] ${active ? 'text-brand-700' : 'text-ink-soft'}`}>{active ? (desc ? '▼' : '▲') : '↕'}</span>
    </button>
  );
};

/** Table view for the All Notes page (design: Title | Folder | Last Modified) */
const NotesTable = ({ notes, onChanged, onRemoved, showSnippet = true, selectable = false, selectedIds = [], onToggleSelect, onToggleAll, sort, onSort }) => (
  <div className="card overflow-hidden">
    {/* header - desktop only */}
    <div
      className={`hidden items-center gap-4 border-b border-line bg-slate-50/60 px-5 py-3 md:grid ${
        selectable ? 'grid-cols-[36px_minmax(0,1fr)_170px_150px_56px]' : 'grid-cols-[minmax(0,1fr)_170px_150px_56px]'
      }`}
    >
      {selectable && (
        <input
          type="checkbox"
          className="checkbox"
          checked={notes.length > 0 && notes.every((n) => selectedIds.includes(n.id))}
          onChange={(e) => onToggleAll(e.target.checked)}
          aria-label="Select all notes"
        />
      )}
      <SortHead label="Title" field="title" sort={sort} onSort={onSort} />
      <span className="table-head">Folder</span>
      <SortHead label="Last modified" field="updatedAt" sort={sort} onSort={onSort} />
      <span className="table-head text-right">Actions</span>
    </div>

    <div className="divide-y divide-line">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50/70 md:gap-4 md:px-5 ${
            selectable ? 'md:grid-cols-[36px_minmax(0,1fr)_170px_150px_56px]' : 'md:grid-cols-[minmax(0,1fr)_170px_150px_56px]'
          } ${selectedIds.includes(note.id) ? 'bg-brand-50/60' : ''}`}
        >
          {selectable && (
            <input
              type="checkbox"
              className="checkbox"
              checked={selectedIds.includes(note.id)}
              onChange={() => onToggleSelect(note.id)}
              aria-label={`Select ${note.title}`}
            />
          )}
          {/* title */}
          <Link to={`/notes/${note.id}`} className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <FileText size={15} />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-[14.5px] font-semibold text-ink group-hover:text-brand-700">{note.title}</span>
                {note.isPinned && <Pin size={13} className="shrink-0 text-brand-600" />}
                {note.isFavorite && <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />}
              </span>
              {showSnippet && note.snippet && <span className="clamp-2 mt-0.5 block text-[12.5px] leading-relaxed text-ink-muted">{note.snippet}</span>}
            </span>
          </Link>

          {/* folder */}
          <span className="hidden truncate text-[13px] text-ink-muted md:block">
            {note.folder?.name ? (
              <Link to={`/folders/${note.folder.id}`} className="hover:text-brand-700 hover:underline">
                {note.folder.name}
              </Link>
            ) : (
              <span className="text-ink-soft">—</span>
            )}
          </span>

          {/* last modified */}
          <span className="hidden text-[13px] text-ink-muted md:block">{timeAgo(note.lastEditedAt || note.updatedAt)}</span>

          {/* actions */}
          <span className="flex justify-end">
            <NoteActionsMenu note={note} onChanged={onChanged} onRemoved={onRemoved} showOpen={false} />
          </span>

          {/* mobile meta */}
          <span className="col-span-2 flex items-center gap-2 text-[12px] text-ink-soft md:hidden">
            {note.folder?.name && <span className="truncate">{note.folder.name}</span>}
            {note.folder?.name && <span>·</span>}
            <span className="shrink-0">{timeAgo(note.lastEditedAt || note.updatedAt)}</span>
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default NotesTable;
