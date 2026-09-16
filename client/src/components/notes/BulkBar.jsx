import { useState } from 'react';
import { Pin, Star, Trash2, X, FolderInput, Tag as TagIcon } from 'lucide-react';
import { IconButton } from '../ui/Button.jsx';
import Menu, { MenuItem } from '../ui/Menu.jsx';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFolders } from '../../context/FoldersContext.jsx';

/**
 * Floating action bar shown while notes are selected in the All Notes list:
 * move to folder, add tag, pin, favorite, trash, clear selection.
 */
const BulkBar = ({ ids, onDone }) => {
  const toast = useToast();
  const { flatOptions } = useFolders();
  const [tags, setTags] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (action, value) => {
    setBusy(true);
    try {
      const { message } = await api.patch('/notes/bulk', { ids, action, value });
      toast.success(message || 'Notes updated');
      onDone();
    } catch (e) {
      toast.error(e.message || 'Bulk action failed');
    } finally {
      setBusy(false);
    }
  };

  const loadTags = () => {
    if (tags) return;
    api
      .get('/tags')
      .then(({ data }) => setTags(data.tags || []))
      .catch(() => setTags([]));
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-in">
      <div className="card flex items-center gap-1.5 rounded-2xl px-3.5 py-2 shadow-pop">
        <span className="pr-1 text-[13px] font-semibold text-ink">
          {ids.length} selected
        </span>
        <span className="mx-1 h-5 w-px bg-line" />

        <Menu
          trigger={<IconButton icon={FolderInput} label="Move to folder" disabled={busy} />}
          menuClassName="max-h-[280px] min-w-[200px] overflow-y-auto"
        >
          <MenuItem onClick={() => run('move', null)}>Uncategorized</MenuItem>
          {flatOptions.map((f) => (
            <MenuItem key={f.id} onClick={() => run('move', f.id)}>
              {'\u00A0\u00A0'.repeat(f.depth)}
              {f.name}
            </MenuItem>
          ))}
        </Menu>

        <Menu trigger={<IconButton icon={TagIcon} label="Add tag" disabled={busy} onClick={loadTags} />} menuClassName="max-h-[240px] min-w-[180px] overflow-y-auto">
          {tags === null ? (
            <MenuItem onClick={() => {}}>Loading tags...</MenuItem>
          ) : tags.length === 0 ? (
            <MenuItem onClick={() => {}}>No tags yet</MenuItem>
          ) : (
            tags.map((t) => (
              <MenuItem key={t.id || t.name} onClick={() => run('tag', t.name)}>
                # {t.name}
              </MenuItem>
            ))
          )}
        </Menu>

        <IconButton icon={Pin} label="Pin selected" disabled={busy} onClick={() => run('pin', true)} />
        <IconButton icon={Star} label="Favorite selected" disabled={busy} onClick={() => run('favorite', true)} />
        <IconButton icon={Trash2} label="Move selected to trash" disabled={busy} onClick={() => run('trash', true)} />

        <span className="mx-1 h-5 w-px bg-line" />
        <IconButton icon={X} label="Clear selection" onClick={onDone} />
      </div>
    </div>
  );
};

export default BulkBar;
