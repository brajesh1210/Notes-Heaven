import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Check, Loader2, AlertCircle, Cloud, RotateCcw, Trash2, FolderOpen, Star, Pin, Download } from 'lucide-react';
import Button, { IconButton } from '../../components/ui/Button.jsx';
import NoteEditor from '../../components/editor/NoteEditor.jsx';
import NoteActionsMenu from '../../components/notes/NoteActionsMenu.jsx';
import TagInput from '../../components/notes/TagInput.jsx';
import Menu, { MenuItem, MenuDivider, MenuLabel } from '../../components/ui/Menu.jsx';
import { PageLoader } from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { api } from '../../lib/api.js';
import { useFolders } from '../../context/FoldersContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAutosave } from '../../hooks/useAutosave.js';
import { cn, fullDateTime, timeAgo } from '../../lib/utils.js';
import { exportNoteAsPdf } from '../../lib/export.js';

const SaveStatus = ({ status, lastSavedAt }) => {
  const map = {
    idle: { icon: Cloud, text: 'Autosave on', cls: 'text-ink-soft' },
    pending: { icon: Loader2, text: 'Saving...', cls: 'text-brand-700', spin: true },
    saving: { icon: Loader2, text: 'Saving...', cls: 'text-brand-700', spin: true },
    saved: { icon: Check, text: lastSavedAt ? `Saved ${timeAgo(lastSavedAt)}` : 'Saved', cls: 'text-emerald-600' },
    error: { icon: AlertCircle, text: 'Save fail hua - retry', cls: 'text-red-600' },
  };
  const s = map[status] || map.idle;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[12.5px] font-medium', s.cls)}>
      <s.icon size={13} className={s.spin ? 'animate-spin' : ''} /> {s.text}
    </span>
  );
};

/** Note Editor page (design 6) - autosave + full toolbar + folder/tags */
const NoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { flatOptions, byId } = useFolders();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(null);
  const [contentHtml, setContentHtml] = useState('');
  const [folder, setFolder] = useState('');
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // autosave payload ref - hamesha latest values
  const payloadRef = useRef({ title: '', content: null, contentHtml: '' });
  payloadRef.current = { title, content, contentHtml };

  const getPayload = useCallback(() => payloadRef.current, []);

  const { status, lastSavedAt, scheduleSave, saveNow } = useAutosave(id, getPayload, {
    delay: 1200,
    enabled: Boolean(id) && !note?.isTrashed,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/notes/${id}`);
      const n = data.note;
      setNote(n);
      setTitle(n.title || '');
      setContent(n.content || { type: 'doc', content: [{ type: 'paragraph' }] });
      setContentHtml(n.contentHtml || '');
      setFolder(n.folder?.id || '');
      setTags((n.tags || []).map((t) => t.name));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => {
    if (!note) return false;
    return title !== note.title || JSON.stringify(content) !== JSON.stringify(note.content);
  }, [note, title, content]);

  /** editor + title change hone par autosave schedule */
  const onEditorChange = ({ json, html }) => {
    setContent(json);
    setContentHtml(html);
    scheduleSave();
  };

  const onTitleChange = (v) => {
    setTitle(v);
    scheduleSave();
  };

  /** folder / tags change turant save karte hain */
  const changeFolder = async (folderId) => {
    setFolder(folderId);
    try {
      await api.put(`/notes/${id}`, { folder: folderId || null });
      toast.success(folderId ? 'Folder update ho gaya' : 'Note uncategorized kar diya');
      setNote((n) => ({ ...n, folder: folderId ? { id: folderId, name: byId.get(folderId)?.name } : null }));
    } catch (e) {
      toast.error(e.message);
    }
  };

  const changeTags = async (next) => {
    setTags(next);
    try {
      await api.put(`/notes/${id}`, { tags: next });
    } catch (e) {
      toast.error(e.message);
    }
  };

  const saveAll = async () => {
    await saveNow();
    try {
      const { data } = await api.put(`/notes/${id}`, {
        title,
        content,
        contentHtml,
        createVersion: true,
      });
      setNote(data.note);
      toast.success('Note save ho gaya ✅');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const restore = async () => {
    try {
      await api.patch(`/notes/${id}/restore`);
      toast.success('Note restore ho gaya 🎉');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <PageLoader label="Note load ho raha hai..." />;

  if (!note) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Note nahi mila"
        description="Shayad ye delete ho gaya hai."
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
      {/* trash banner */}
      {note.isTrashed && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle size={16} className="text-amber-600" />
          <p className="flex-1 text-[13px] text-amber-900">
            Ye note trash me hai{note.daysLeft !== null ? ` - ${note.daysLeft} din me permanently delete ho jayega` : ''}. Edit karne ke
            liye pehle restore karo.
          </p>
          <Button size="sm" variant="outline" icon={RotateCcw} onClick={restore}>
            Restore
          </Button>
        </div>
      )}

      {/* header: back + folder chip + actions */}
      <div className="mb-2 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="rounded-[10px] p-2 text-ink-muted transition hover:bg-slate-100 hover:text-ink" aria-label="Go back">
          <ArrowLeft size={18} />
        </button>

        {/* folder chip dropdown */}
        <Menu
          align="left"
          trigger={
            <button className="chip hover:bg-brand-100">
              <FolderOpen size={12} /> {byId.get(folder)?.name || 'No folder'}
            </button>
          }
          menuClassName="min-w-[230px] max-h-[320px] overflow-y-auto"
        >
          <MenuLabel>Move to folder</MenuLabel>
          <MenuItem icon={FolderOpen} onClick={() => changeFolder('')} className={cn(!folder && 'bg-brand-50 text-brand-700')}>
            No folder
          </MenuItem>
          <MenuDivider />
          {flatOptions.map((f) => (
            <MenuItem key={f.id} icon={FolderOpen} onClick={() => changeFolder(f.id)} className={cn(folder === f.id && 'bg-brand-50 text-brand-700')}>
              <span style={{ paddingLeft: f.level * 10 }}>{f.name}</span>
            </MenuItem>
          ))}
        </Menu>

        <div className="ml-auto flex items-center gap-1">
          <IconButton
            icon={Star}
            label="Toggle favorite"
            active={note.isFavorite}
            className={note.isFavorite ? '[&>svg]:fill-amber-400 [&>svg]:text-amber-400' : ''}
            onClick={async () => {
              const value = !note.isFavorite;
              setNote({ ...note, isFavorite: value });
              await api.patch(`/notes/${id}/favorite`, { value });
            }}
          />
          <IconButton
            icon={Pin}
            label="Toggle pin"
            active={note.isPinned}
            onClick={async () => {
              const value = !note.isPinned;
              setNote({ ...note, isPinned: value });
              await api.patch(`/notes/${id}/pin`, { value });
            }}
          />
          <IconButton icon={Download} label="Export as PDF" onClick={() => exportNoteAsPdf({ ...note, title, contentHtml })} />
          <NoteActionsMenu note={{ ...note, title }} onRemoved={() => navigate('/notes')} onChanged={load} showOpen={false} />
        </div>
      </div>

      {/* title */}
      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Untitled note"
        className="w-full border-none bg-transparent px-2 text-[26px] font-bold tracking-[-0.02em] text-ink placeholder:text-ink-soft focus:outline-none"
      />

      {/* tags */}
      <div className="mt-2 px-2">
        <TagInput value={tags} onChange={changeTags} allTags={allTags} onTagsLoaded={setAllTags} />
      </div>

      {/* editor */}
      <div className="mt-4 rounded-xl border border-line bg-white">
        <NoteEditor content={content} onChange={onEditorChange} editable={!note.isTrashed} placeholder="Start writing your note..." />
      </div>

      {/* footer */}
      <div className="sticky bottom-0 mt-4 flex flex-wrap items-center gap-3 border-t border-line bg-canvas/95 py-3 backdrop-blur">
        <span className="text-[12.5px] text-ink-muted">
          Last edited: <span className="font-medium text-ink">{fullDateTime(note.lastEditedAt)}</span>
        </span>
        <span className="hidden text-ink-soft sm:inline">·</span>
        <SaveStatus status={status} lastSavedAt={lastSavedAt} />

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-[12px] text-ink-soft sm:inline">
            <span className="kbd">Ctrl</span> + <span className="kbd">S</span> se save
          </span>
          <Button variant="outline" icon={Trash2} onClick={() => navigate('/notes')} className="hidden sm:inline-flex">
            All notes
          </Button>
          <Button icon={Save} onClick={saveAll} disabled={note.isTrashed || (!dirty && status === 'idle')}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditorPage;
