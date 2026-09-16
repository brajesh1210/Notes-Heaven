import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import EditorToolbar from './EditorToolbar.jsx';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { cn } from '../../lib/utils.js';

const lowlight = createLowlight(common);

/** Image extension + Cloudinary publicId attr (delete ke liye kaam aata hai) */
const CloudImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      publicId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-public-id'),
        renderHTML: (attrs) => (attrs.publicId ? { 'data-public-id': attrs.publicId } : {}),
      },
    };
  },
});

const buildExtensions = (placeholder) => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    codeBlock: false, // lowlight wala use karenge
    horizontalRule: {},
  }),
  Underline,
  Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
  CloudImage.configure({ inline: false, allowBase64: true, HTMLAttributes: { class: 'rounded-xl' } }),
  Placeholder.configure({ placeholder }),
  TaskList,
  TaskItem.configure({ nested: true }),
  CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'javascript' }),
];

/**
 * NoteEditor
 *   content    -> TipTap JSON | null
 *   onChange   -> ({ json, html, text, words })
 *   editable   -> false kar do to read-only view ban jata hai (Note View page)
 */
const NoteEditor = ({ content, onChange, placeholder = 'Start writing your note...', editable = true, onReady, className, minHeight }) => {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const lastEmitted = useRef(null);
  const uploadRef = useRef(null);

  const editor = useEditor({
    extensions: buildExtensions(placeholder),
    content: content || { type: 'doc', content: [{ type: 'paragraph' }] },
    editable,
    editorProps: {
      attributes: { class: cn('focus:outline-none', className) },
      handleDrop: (view, event) => {
        const file = event.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          event.preventDefault();
          uploadRef.current?.(file);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const file = event.clipboardData?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          event.preventDefault();
          uploadRef.current?.(file);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (!onChange) return;
      const json = ed.getJSON();
      lastEmitted.current = json;
      onChange({
        json,
        html: ed.getHTML(),
        text: ed.getText(),
        words: ed.getText().split(/\s+/).filter(Boolean).length,
      });
    },
  });

  // bahar se content badle (note load hone par) to editor sync karo
  useEffect(() => {
    if (!editor || !content) return;
    if (lastEmitted.current === content) return;
    const current = JSON.stringify(editor.getJSON());
    if (current !== JSON.stringify(content)) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor && onReady) onReady(editor);
  }, [editor, onReady]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  /** image -> Cloudinary -> editor me insert */
  const uploadAndInsert = async (file) => {
    if (!editor) return;
    if (file.size > 8 * 1024 * 1024) return toast.error('Image 8MB se chhoti honi chahiye');

    // turant local preview dikha do (feel fast)
    const localUrl = URL.createObjectURL(file);
    const { from } = editor.state.selection;
    editor.chain().focus().insertContentAt(from, { type: 'image', attrs: { src: localUrl } }).run();

    try {
      setUploading(true);
      const { data } = await api.upload(file);
      const url = data.image.url;
      // local preview ko asli URL se replace karo
      const { doc, tr } = editor.state;
      let replaced = false;
      doc.descendants((node, pos) => {
        if (replaced) return;
        if (node.type.name === 'image' && node.attrs.src === localUrl) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: url, publicId: data.image.publicId });
          replaced = true;
        }
      });
      if (replaced) editor.view.dispatch(tr);
      toast.success('Image add ho gayi 🖼️');
    } catch (e) {
      toast.error(e.message || 'Image upload fail hua');
      // fail hone par local preview hata do
      const { doc, tr } = editor.state;
      doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === localUrl) tr.delete(pos, pos + node.nodeSize);
      });
      editor.view.dispatch(tr);
    } finally {
      setUploading(false);
      setTimeout(() => URL.revokeObjectURL(localUrl), 2000);
    }
  };

  uploadRef.current = uploadAndInsert;

  return (
    <div className="w-full">
      {editable && <EditorToolbar editor={editor} onPickImage={uploadAndInsert} uploading={uploading} />}
      <div onClick={() => editable && editor?.chain().focus().run()} style={minHeight ? { minHeight } : undefined} className="cursor-text px-0.5 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default NoteEditor;
