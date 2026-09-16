import Modal from '../ui/Modal.jsx';

const ROWS = [
  { keys: ['Ctrl', 'K'], label: 'Focus the search bar' },
  { keys: ['Ctrl', 'S'], label: 'Save the note (editor)' },
  { keys: ['Ctrl', '/'], label: 'Open this shortcuts help' },
  { keys: ['Ctrl', 'B'], label: 'Bold selection (editor)' },
  { keys: ['Ctrl', 'I'], label: 'Italic selection (editor)' },
  { keys: ['Ctrl', 'U'], label: 'Underline selection (editor)' },
  { keys: ['Esc'], label: 'Close dialogs, menus and suggestions' },
];

const Key = ({ children }) => <span className="kbd">{children}</span>;

/** Keyboard shortcuts reference - opened from the topbar or Ctrl+/ */
const ShortcutsModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="Keyboard shortcuts" size="sm">
    <div className="space-y-2.5">
      {ROWS.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4">
          <span className="text-[13px] text-ink-muted">{r.label}</span>
          <span className="flex shrink-0 items-center gap-1">
            {r.keys.map((k, i) => (
              <span key={k} className="flex items-center gap-1">
                {i > 0 && <span className="text-[11px] text-ink-soft">+</span>}
                <Key>{k}</Key>
              </span>
            ))}
          </span>
        </div>
      ))}
      <p className="pt-1 text-[12px] leading-relaxed text-ink-soft">
        On macOS use the Command key instead of Ctrl.
      </p>
    </div>
  </Modal>
);

export default ShortcutsModal;
