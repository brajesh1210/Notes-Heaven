import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import TagInput from '../../components/notes/TagInput.jsx';
import NoteEditor from '../../components/editor/NoteEditor.jsx';
import { api } from '../../lib/api.js';
import { useFolders } from '../../context/FoldersContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * Create Note page (design 5):
 * Note Title → Select Folder → Note Content → Cancel / Save Note
 */
const CreateNote = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { flatOptions } = useFolders();

  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState(params.get('folder') || '');
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState('');

  const handleEditorChange = ({ json }) => setContent(json);

  const save = async (goToEditor = true) => {
    if (!title.trim()) {
      setTitleError('Note ko ek title do (e.g. "Business Environment - Chapter 1")');
      return;
    }
    setTitleError('');
    setSaving(true);
    try {
      const { data, message } = await api.post('/notes', {
        title: title.trim(),
        content,
        folder: folder || null,
        tags,
        contentHtml: '',
      });
      toast.success(message || 'Note create ho gaya 🎉');
      navigate(goToEditor ? `/notes/${data.note.id}/edit` : `/notes/${data.note.id}`, { replace: true });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[860px]">
      {/* header */}
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-[10px] p-2 text-ink-muted transition hover:bg-slate-100 hover:text-ink" aria-label="Go back">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[22px] font-bold tracking-[-0.01em] text-ink">Create New Note</h1>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="space-y-5">
          {/* title */}
          <div>
            <label htmlFor="note-title" className="label">
              Note Title <span className="text-red-500">*</span>
            </label>
            <input
              id="note-title"
              value={title}
              autoFocus
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError('');
              }}
              placeholder="Enter note title..."
              maxLength={200}
              className={`input py-2.5 text-[15px] ${titleError ? 'input-error' : ''}`}
            />
            {titleError && <p className="field-error">{titleError}</p>}
          </div>

          {/* folder + tags */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="note-folder" className="label">
                Select Folder
              </label>
              <select id="note-folder" value={folder} onChange={(e) => setFolder(e.target.value)} className="input bg-white">
                <option value="">— No folder (uncategorized) —</option>
                {flatOptions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {'\u00A0'.repeat(f.level * 3)}
                    {f.level > 0 ? '└ ' : ''}
                    {f.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-ink-soft">Nested folder me rakhna ho to pehle wahan subfolder bana lo.</p>
            </div>

            <div>
              <span className="label">Tags (optional)</span>
              <TagInput value={tags} onChange={setTags} allTags={allTags} onTagsLoaded={setAllTags} />
            </div>
          </div>

          {/* content */}
          <div>
            <span className="label">Note Content</span>
            <div className="rounded-xl border border-line">
              <NoteEditor content={content} onChange={handleEditorChange} placeholder="Start writing your note..." />
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Toolbar se headings, lists, code blocks aur images add karo. Save ke baad editor me autosave chalu ho jayega.
            </p>
          </div>
        </div>
      </div>

      {/* actions */}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" icon={X} onClick={() => navigate(-1)} disabled={saving}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => save(false)} loading={saving} disabled={saving}>
          Save & view
        </Button>
        <Button icon={Save} onClick={() => save(true)} loading={saving}>
          Save Note
        </Button>
      </div>
    </div>
  );
};

export default CreateNote;
