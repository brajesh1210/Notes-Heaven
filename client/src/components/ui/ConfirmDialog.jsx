import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { AlertTriangle, Trash2, RotateCcw } from 'lucide-react';

/** Confirms destructive actions such as delete / restore */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
}) => {
  const Icon = tone === 'danger' ? Trash2 : tone === 'warning' ? AlertTriangle : RotateCcw;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          <Icon size={18} />
        </span>
        <p className="text-sm leading-relaxed text-ink-muted">
          {description || 'This action cannot be undone. Do you want to continue?'}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
