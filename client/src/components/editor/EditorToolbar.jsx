import { useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Code2,
  SquareCode,
  Quote,
  Image as ImageIcon,
  Link2,
  Minus,
  Undo2,
  Redo2,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

const ToolButton = ({ icon: Icon, label, onClick, active = false, disabled = false, className }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className={cn(
      'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition',
      'hover:bg-slate-100 hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent',
      active && 'bg-brand-50 text-brand-700 hover:bg-brand-50 hover:text-brand-700',
      className
    )}
  >
    <Icon size={16} />
  </button>
);

const Sep = () => <span className="mx-1 h-5 w-px shrink-0 bg-line" />;

/** TipTap editor formatting toolbar (matches the design) */
const EditorToolbar = ({ editor, onPickImage, uploading = false, className }) => {
  const fileRef = useRef(null);
  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter link URL:', previous);
    if (url === null) return;
    if (url === '') return editor.chain().focus().extendMarkRange('link').unsetLink().run();
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const pickImage = () => fileRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (onPickImage) await onPickImage(file);
    else {
      const reader = new FileReader();
      reader.onload = () => editor.chain().focus().setImage({ src: reader.result }).run();
      reader.readAsDataURL(file);
    }
  };

  const heading = (level) => editor.chain().focus().toggleHeading({ level }).run();

  return (
    <div className={cn('sticky top-16 z-20 flex flex-wrap items-center gap-0.5 border-b border-line bg-white px-2 py-1.5', className)}>
      <ToolButton icon={Bold} label="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolButton icon={Italic} label="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolButton
        icon={UnderlineIcon}
        label="Underline (Ctrl+U)"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolButton icon={Strikethrough} label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />

      <Sep />

      <ToolButton icon={Heading1} label="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => heading(1)} />
      <ToolButton icon={Heading2} label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => heading(2)} />
      <ToolButton icon={Heading3} label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => heading(3)} />

      <Sep />

      <ToolButton icon={List} label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolButton
        icon={ListOrdered}
        label="Numbered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolButton icon={ListChecks} label="Task list" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />

      <Sep />

      <ToolButton icon={Code2} label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
      <ToolButton
        icon={SquareCode}
        label="Code block"
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <ToolButton icon={Quote} label="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />

      <Sep />

      <ToolButton icon={uploading ? Loader2 : ImageIcon} label="Insert image" onClick={pickImage} className={uploading ? 'animate-pulse' : ''} />
      <ToolButton icon={Link2} label="Insert link" active={editor.isActive('link')} onClick={setLink} />
      <ToolButton icon={Minus} label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} />

      <Sep />

      <ToolButton icon={Undo2} label="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
      <ToolButton icon={Redo2} label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

export default EditorToolbar;
