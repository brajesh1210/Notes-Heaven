import { Link } from 'react-router-dom';
import { FileText, Pin, Star } from 'lucide-react';
import { cn, timeAgo } from '../../lib/utils.js';
import NoteActionsMenu from './NoteActionsMenu.jsx';

/** Note row for the Dashboard / folder pages (icon + title + folder • time + ...) */
const NoteRow = ({ note, onChanged, onRemoved, showFolder = true, className }) => (
  <div
    className={cn(
      'group flex items-center gap-3.5 rounded-xl border border-transparent px-3 py-3 transition hover:border-line hover:bg-white hover:shadow-card',
      className
    )}
  >
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
      <FileText size={16} />
    </span>

    <Link to={`/notes/${note.id}`} className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5">
        <p className="truncate text-[14.5px] font-semibold text-ink group-hover:text-brand-700">{note.title}</p>
        {note.isPinned && <Pin size={13} className="shrink-0 text-brand-600" />}
        {note.isFavorite && <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />}
      </div>
      {note.snippet && <p className="clamp-2 mt-0.5 hidden text-[13px] leading-relaxed text-ink-muted sm:block">{note.snippet}</p>}
      <p className="mt-0.5 truncate text-[12.5px] text-ink-soft">
        {showFolder && note.folder?.name ? `${note.folder.name} · ` : ''}
        {timeAgo(note.lastEditedAt || note.updatedAt)}
        {note.isTrashed && note.daysLeft !== null && note.daysLeft !== undefined ? ` · deletes in ${note.daysLeft}d` : ''}
      </p>
    </Link>

    <NoteActionsMenu
      note={note}
      onChanged={onChanged}
      onRemoved={onRemoved}
      className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
    />
  </div>
);

export default NoteRow;
