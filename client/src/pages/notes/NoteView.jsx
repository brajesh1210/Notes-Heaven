import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Download, FolderOpen, Star, Pin, Clock, Hash, FileText } from 'lucide-react';
import Button, { IconButton } from '../../components/ui/Button.jsx';
import NoteEditor from '../../components/editor/NoteEditor.jsx';
import NoteActionsMenu from '../../components/notes/NoteActionsMenu.jsx';
import { PageLoader } from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { exportNoteAsPdf } from '../../lib/export.js';
import { cn, fullDateTime, friendlyDate, timeAgo } from '../../lib/utils.js';

/** Note View page (design 8) - read-only view + edit / export / delete */
const NoteView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/notes/${id}`);
      setNote(data.note);
    } catch (e) {
      toast.error(e.message);
      setNote(null);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageLoader label="Opening note..." />;

  if (!note) {
    return (
      <EmptyState
        icon={FileText}
        title="Note not found"
        description="This note may have been deleted, or the link is incorrect."
        action={
          <Button variant="outline" onClick={() => navigate('/notes')}>
            All notes
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-[900px]">
      {/* header */}
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="rounded-[10px] p-2 text-ink-muted transition hover:bg-slate-100 hover:text-ink" aria-label="Go back">
          <ArrowLeft size={18} />
        </button>

        {note.folder && (
          <button onClick={() => navigate(`/folders/${note.folder.id}`)} className="chip hover:bg-brand-100">
            <FolderOpen size={12} /> {note.folder.name}
          </button>
        )}

        {note.isPinned && (
          <span className="chip-muted">
            <Pin size={12} /> Pinned
          </span>
        )}
        {note.isFavorite && (
          <span className="chip-muted">
            <Star size={12} className="fill-amber-400 text-amber-400" /> Favorite
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="outline" icon={Pencil} onClick={() => navigate(`/notes/${id}/edit`)}>
            Edit
          </Button>
          <IconButton icon={Download} label="Export as PDF" onClick={() => exportNoteAsPdf(note)} />
          <NoteActionsMenu note={note} onChanged={load} onRemoved={() => navigate('/notes')} showOpen={false} />
        </div>
      </div>

      {note.isTrashed && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          This note is in trash - it will be permanently deleted in {note.daysLeft ?? 0} days. Restore it from the "..." menu.
        </div>
      )}

      {/* title + meta */}
      <h1 className="px-2 text-[30px] font-bold leading-tight tracking-[-0.02em] text-ink">{note.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-2 text-[12.5px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} /> {timeAgo(note.lastEditedAt)} (created {friendlyDate(note.createdAt)})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileText size={13} /> {note.wordCount} words · {note.readingTime} min read
        </span>
        {note.tags?.length > 0 && (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <Hash size={13} />
            {note.tags.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/search?q=${encodeURIComponent(t.name)}`)}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11.5px] font-medium text-ink-muted hover:bg-brand-50 hover:text-brand-700"
              >
                {t.name}
              </button>
            ))}
          </span>
        )}
      </div>

      <div className="my-5 h-px w-full bg-line" />

      {/* content - read only editor (same styling as edit mode) */}
      <div className="note-view px-2">
        {note.content ? (
          <NoteEditor content={note.content} editable={false} />
        ) : (
          <p className="text-sm text-ink-soft">This note has no content yet.</p>
        )}
      </div>

      {/* footer */}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-4 text-[12.5px] text-ink-muted">
        <span>
          Last edited: <span className="font-medium text-ink">{fullDateTime(note.lastEditedAt)}</span>
        </span>
        <div className="ml-auto flex items-center gap-1">
          <IconButton icon={Pencil} label="Edit note" onClick={() => navigate(`/notes/${id}/edit`)} />
          <IconButton icon={Download} label="Export as PDF" onClick={() => exportNoteAsPdf(note)} />
          <NoteActionsMenu note={note} onChanged={load} onRemoved={() => navigate('/notes')} showOpen={false} />
        </div>
      </div>

      <p className={cn('mt-6 text-center text-[11.5px] text-ink-soft')}>
        Created {fullDateTime(note.createdAt)} · Updated {fullDateTime(note.updatedAt)}
        {note.versionCount ? ` · ${note.versionCount} saved versions` : ''}
      </p>
    </div>
  );
};

export default NoteView;
