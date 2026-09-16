import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Folder } from 'lucide-react';
import { useFolders } from '../../context/FoldersContext.jsx';
import { FOLDER_COLORS } from '../../lib/constants.js';
import { cn } from '../../lib/utils.js';

/**
 * Folder create / edit / delete modal.
 * - parent select se nested folder bana sakte ho
 * - edit mode me delete button bhi dikhta hai
 */
const FolderModal = ({ open, onClose, folder = null, defaultParent = null }) => {
  const { flatOptions, createFolder, updateFolder, deleteFolder } = useFolders();
  const isEdit = Boolean(folder?.id);

  const [name, setName] = useState('');
  const [parent, setParent] = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(folder?.name || '');
    setParent(folder?.parent || defaultParent || '');
    setColor(folder?.color || FOLDER_COLORS[0]);
    setError('');
  }, [open, folder, defaultParent]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Folder name daalo');

    setSaving(true);
    setError('');
    try {
      if (isEdit) await updateFolder(folder.id, { name: name.trim(), color, parent: parent || null });
      else await createFolder({ name: name.trim(), color, parent: parent || null });
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFolder(folder.id, 'trash');
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // khud ya uska child parent na ban sake
  const options = flatOptions.filter((f) => f.id !== folder?.id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit folder' : 'New folder'}
      description={isEdit ? 'Naam, color ya parent folder change karo.' : 'Apne notes ko organized rakhne ke liye folder banao.'}
      size="sm"
      footer={
        <>
          {isEdit && (
            <Button variant="danger-soft" onClick={handleDelete} loading={deleting} className="sm:mr-auto">
              Delete folder
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="folder-form" loading={saving}>
            {isEdit ? 'Save changes' : 'Create folder'}
          </Button>
        </>
      }
    >
      <form id="folder-form" onSubmit={submit} className="space-y-4">
        <Input
          label="Folder name"
          name="name"
          autoFocus
          placeholder="e.g. Class 12, Physics, Personal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          maxLength={80}
        />

        <div>
          <label className="label" htmlFor="parent">
            Parent folder (optional)
          </label>
          <select id="parent" value={parent} onChange={(e) => setParent(e.target.value)} className="input appearance-none bg-white">
            <option value="">— No parent (top level) —</option>
            {options.map((f) => (
              <option key={f.id} value={f.id}>
                {'\u00A0'.repeat(f.level * 3)}
                {f.level > 0 ? '└ ' : ''}
                {f.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-ink-soft">Parent select karne se nested folder banega (e.g. Class 12 → Physics).</p>
        </div>

        <div>
          <span className="label">Color</span>
          <div className="flex flex-wrap gap-2">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ background: c }}
                className={cn('h-7 w-7 rounded-full transition ring-offset-2', color === c ? 'ring-2 ring-slate-900' : 'hover:scale-110')}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[13px] text-ink-muted">
          <Folder size={15} style={{ color }} />
          Preview: <span className="font-medium text-ink">{name || 'Folder name'}</span>
          {parent && <span className="text-ink-soft">→ nested</span>}
        </div>
      </form>
    </Modal>
  );
};

export default FolderModal;
