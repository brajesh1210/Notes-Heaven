import { useCallback, useEffect, useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import NoteRow from '../components/notes/NoteRow.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { SkeletonList } from '../components/ui/Spinner.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { TRASH_RETENTION_DAYS } from '../lib/constants.js';

/** Trash - recover or permanently delete within 5 days */
const Trash = () => {
  const toast = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notes/trash');
      setNotes(data.notes || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const emptyTrash = async () => {
    setBusy(true);
    try {
      const { message } = await api.delete('/notes/trash/empty');
      toast.success(message || 'Trash emptied');
      setConfirmEmpty(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const restoreAll = async () => {
    setBusy(true);
    try {
      await Promise.all(notes.map((n) => api.patch(`/notes/${n.id}/restore`)));
      toast.success('All notes restored');
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Trash"
        subtitle={loading ? 'Loading...' : `${notes.length} note${notes.length === 1 ? '' : 's'} in trash`}
        actions={
          notes.length > 0 && (
            <>
              <Button variant="outline" icon={RotateCcw} onClick={restoreAll} loading={busy}>
                Restore all
              </Button>
              <Button variant="danger" icon={Trash2} onClick={() => setConfirmEmpty(true)}>
                Empty trash
              </Button>
            </>
          )
        }
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-[13px] leading-relaxed text-amber-900">
          Notes in trash are permanently deleted automatically after <span className="font-semibold">{TRASH_RETENTION_DAYS} days</span>.
          Until then you can <span className="font-semibold">Restore</span> them at any time, or delete them forever right away.
        </p>
      </div>

      {loading ? (
        <SkeletonList rows={4} />
      ) : notes.length === 0 ? (
        <EmptyState icon={Trash2} title="Trash is empty" description="Notes you delete will appear here - safe for 5 days." />
      ) : (
        <div className="space-y-1.5">
          {notes.map((n) => (
            <div key={n.id} className="relative">
              <NoteRow note={n} onChanged={load} />
              <span className="absolute -top-0 right-14 hidden items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 sm:inline-flex">
                <AlertTriangle size={11} />
                {n.daysLeft !== null && n.daysLeft !== undefined ? `${n.daysLeft} days left` : 'deleting soon'}
              </span>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmEmpty}
        onClose={() => setConfirmEmpty(false)}
        onConfirm={emptyTrash}
        loading={busy}
        title="Empty the trash?"
        description={`All ${notes.length} notes will be deleted forever. This action cannot be undone.`}
        confirmLabel="Empty trash"
      />
    </div>
  );
};

export default Trash;
