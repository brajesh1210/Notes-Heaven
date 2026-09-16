import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Pencil, Pin, PinOff, Star, StarOff, Copy, Download, Trash2, RotateCcw, Eye, FileJson, FileText } from 'lucide-react';
import Menu, { MenuItem, MenuDivider } from '../ui/Menu.jsx';
import { IconButton } from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { exportNoteAsPdf, exportNoteAsMarkdown, exportNoteAsJson } from '../../lib/export.js';

/**
 * Har jagah use hone wala note "..." menu:
 * Open, Edit, Pin, Favorite, Duplicate, Export (PDF/MD/JSON), Trash, Restore, Delete permanently
 */
const NoteActionsMenu = ({ note, onChanged, onRemoved, showOpen = true, size = 18, className }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [confirm, setConfirm] = useState(null); // 'trash' | 'delete'
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
      toast.success('Note duplicate ho gaya');
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
      toast.success(message || 'Note trash me chala gaya');
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
      toast.success('Note permanently delete ho gaya');
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
      toast.success('Note restore ho gaya 🎉');
      onRemoved?.('restore');
      onChanged?.();
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Export ke liye poora note (content ke saath) chahiye
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
          onClick={() => patch('/pin', { value: !note.isPinned }, note.isPinned ? 'Pin hata diya' : 'Note pin ho gaya 📌')}
        >
          {note.isPinned ? 'Unpin' : 'Pin to top'}
        </MenuItem>
        <MenuItem
          icon={note.isFavorite ? StarOff : Star}
          onClick={() => patch('/favorite', { value: !note.isFavorite }, note.isFavorite ? 'Favorite se hata diya' : 'Favorite me add ho gaya ⭐')}
        >
          {note.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
        </MenuItem>

        <MenuItem icon={Copy} onClick={duplicate}>Duplicate</MenuItem>

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
            toast.success('Markdown file download ho gayi');
          }}
        >
          Export as Markdown
        </MenuItem>
        <MenuItem
          icon={FileJson}
          onClick={async () => {
            const full = await loadFullNote();
            exportNoteAsJson(full);
            toast.success('JSON export ho gaya');
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

      <ConfirmDialog
        open={confirm === 'trash'}
        onClose={() => setConfirm(null)}
        onConfirm={doTrash}
        loading={busy}
        title="Note trash me bhejna hai?"
        description="Note 5 din tak trash me rahega, uske baad automatically delete ho jayega. Aap kabhi bhi restore kar sakte ho."
        confirmLabel="Move to trash"
      />

      <ConfirmDialog
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={doDeleteForever}
        loading={busy}
        title="Permanently delete karna hai?"
        description="Ye note hamesha ke liye delete ho jayega. Ye action undo nahi ho sakta."
        confirmLabel="Delete forever"
      />
    </>
  );
};

export default NoteActionsMenu;
