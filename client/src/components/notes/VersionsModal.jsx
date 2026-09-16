import { useEffect, useState } from 'react';
import { History, RotateCcw } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { friendlyDate, timeAgo } from '../../lib/utils.js';

/**
 * Version history for a note - list saved versions and restore any of them.
 * Restoring first saves the current state as a new version, so undo stays possible.
 */
const VersionsModal = ({ note, open, onClose, onRestored }) => {
  const [versions, setVersions] = useState(null);
  const [busyIndex, setBusyIndex] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!open || !note?.id) return;
    let alive = true;
    setVersions(null);
    api
      .get(`/notes/${note.id}/versions`)
      .then(({ data }) => alive && setVersions(data.versions || []))
      .catch(() => alive && setVersions([]));
    return () => {
      alive = false;
    };
  }, [open, note?.id]);

  const restore = async (index) => {
    setBusyIndex(index);
    try {
      const { message } = await api.post(`/notes/${note.id}/versions/${index}/restore`);
      toast.success(message || 'Previous version restored');
      onRestored?.();
      onClose();
    } catch (e) {
      toast.error(e.message || 'Could not restore the version');
    } finally {
      setBusyIndex(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Version history" size="md">
      {versions === null ? (
        <p className="py-6 text-center text-sm text-ink-muted">Loading versions...</p>
      ) : versions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No saved versions yet"
          description="A version is saved automatically every time you save the note with Save (Ctrl+S)."
        />
      ) : (
        <div className="space-y-2">
          {[...versions].reverse().map((v) => (
            <div key={v.index} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-ink">{v.title || 'Untitled note'}</p>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {friendlyDate(v.savedAt)} · {timeAgo(v.savedAt)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                loading={busyIndex === v.index}
                onClick={() => restore(v.index)}
              >
                Restore
              </Button>
            </div>
          ))}
          <p className="pt-1 text-[12px] leading-relaxed text-ink-soft">
            Restoring a version keeps your current content as a new version, so you can always go back.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default VersionsModal;
