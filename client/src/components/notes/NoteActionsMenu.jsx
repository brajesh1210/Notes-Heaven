import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Pencil, Pin, PinOff, Star, StarOff, Copy, Download, Trash2, RotateCcw, Eye, FileJson, FileText, History } from 'lucide-react';
import Menu, { MenuItem, MenuDivider } from '../ui/Menu.jsx';
import { IconButton } from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import VersionsModal from './VersionsModal.jsx';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { exportNoteAsPdf, exportNoteAsMarkdown, exportNoteAsJson } from '../../lib/export.js';

/**
 * The note "..." menu used across the app:
 * Open, Edit, Pin, Favorite, Duplicate, Export (PDF/MD/JSON), Trash, Restore, Delete permanently
 */
const NoteActionsMenu = ({ note, onChanged, onRemoved, showOpen = true, size = 18, className }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [confirm, setConfirm] = useState(null); // 'trash' | 'delete'
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const patch = async (path, body, message) => {
    try {
      await api.patch(`/notes/${note.id}${path}`, body);
      toast.success(message);
      onChanged?.();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const duplicate = async () => {
    try {
      const { data } = await api.post(`/notes/${note.id}/duplicate`);
      toast.success('Note duplicated');
      onChanged?.();
      navigate(`/notes/${data.note.id}/edit`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const doTrash = async () => {
    setBusy(true);
    try {
      const { message } = await api.delete(`/notes/${note.id}`);
      toast.success(message || 'Note moved to trash');
      onRemoved?.('trash');
      onChanged?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const doDeleteForever = async () => {
    setBusy(true);
    try {
      await api.delete(`/notes/${note.id}/permanent`);
      toast.success('Note permanently deleted');
      onRemoved?.('delete');
      onChanged?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const restore = async () => {
    try {
      await api.patch(`/notes/${note.id}/restore`);
      toast.success('Note restored');
      onRemoved?.('restore');
      onChanged?.();
    } catch (e) {
      toast.error(e.message);
    }
  };

  // exports need the full note (including content)
  const loadFullNote = async () => {
    try {
      const { data } = await api.get(`/notes/${note.id}`);
      return { ...data.note, tags: note.tags };
    } catch {
      return note;
    }
  };

  return (
    <>
      <Menu trigger={<IconButton icon={MoreVertical} label="More actions" size={size} className={className} />} menuClassName="min-w-[210px]">
        {showOpen && <MenuItem icon={Eye} onClick={() => navigate(`/notes/${note.id}`)}>Open note</MenuItem>}
        <MenuItem icon={Pencil} onClick={() => navigate(`/notes/${note.id}/edit`)}>Edit</MenuItem>

        <MenuDivider />

        <MenuItem
          icon={note.isPinned ? PinOff : Pin}
          onClick={() => patch('/pin', { value: !note.isPinned }, note.isPinned ? 'Note unpinned' : 'Note pinned')}
        >
          {note.isPinned ? 'Unpin' : 'Pin to top'}
        </MenuItem>
        <MenuItem
          icon={note.isFavorite ? StarOff : Star}
          onClick={() => patch('/favorite', { value: !note.isFavorite }, note.isFavorite ? 'Removed from favorites' : 'Added to favorites')}
        >
          {note.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
        </MenuItem>

        <MenuItem icon={Copy} onClick={duplicate}>Duplicate</MenuItem>

        <MenuItem icon={History} onClick={() => setHistoryOpen(true)}>Version history</MenuItem>

        <MenuDivider />
        <MenuItem
          icon={Download}
          onClick={async () => {
            const full = await loadFullNote();
            exportNoteAsPdf(full);
          }}
        >
          Export as PDF
        </MenuItem>
        <MenuItem
          icon={FileText}
          onClick={async () => {
            const full = await loadFullNote();
            exportNoteAsMarkdown(full);
            toast.success('Markdown file downloaded');
          }}
        >
          Export as Markdown
        </MenuItem>
        <MenuItem
          icon={FileJson}
          onClick={async () => {
            const full = await loadFullNote();
            exportNoteAsJson(full);
            toast.success('JSON exported');
          }}
        >
          Export as JSON
        </MenuItem>

        <MenuDivider />

        {note.isTrashed ? (
          <>
            <MenuItem icon={RotateCcw} onClick={restore}>Restore note</MenuItem>
            <MenuItem icon={Trash2} danger onClick={() => setConfirm('delete')}>Delete permanently</MenuItem>
          </>
        ) : (
          <MenuItem icon={Trash2} danger onClick={() => setConfirm('trash')}>Move to trash</MenuItem>
        )}
      </Menu>

      <VersionsModal note={note} open={historyOpen} onClose={() => setHistoryOpen(false)} onRestored={onChanged} />


      <ConfirmDialog
        open={confirm === 'trash'}
        onClose={() => setConfirm(null)}
        onConfirm={doTrash}
        loading={busy}
        title="Move note to trash?"
        description="The note will stay in trash for 5 days before being deleted automatically. You can restore it at any time."
        confirmLabel="Move to trash"
      />

      <ConfirmDialog
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={doDeleteForever}
        loading={busy}
        title="Delete permanently?"
        description="This note will be deleted forever. This action cannot be undone."
        confirmLabel="Delete forever"
      />
    </>
  );
};

export default NoteActionsMenu;
