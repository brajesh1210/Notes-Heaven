import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, ChevronRight, Home, FolderOpen, Pencil, MoreVertical, FileText, ArrowLeft } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button, { IconButton } from '../components/ui/Button.jsx';
import NotesTable from '../components/notes/NotesTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonList } from '../components/ui/Spinner.jsx';
import Menu, { MenuItem, MenuDivider } from '../components/ui/Menu.jsx';
import FolderModal from '../components/folders/FolderModal.jsx';
import { api } from '../lib/api.js';
import { useFolders } from '../context/FoldersContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { cn, pluralize } from '../lib/utils.js';

/** Folder tree me se kisi node ke children nikalo */
const findChildren = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node.children || [];
    const deep = findChildren(node.children || [], id);
    if (deep.length) return deep;
  }
  return [];
};

/** Ek folder ka page: breadcrumb, subfolders aur us folder ke notes */
const FolderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { byId, tree, loading: foldersLoading } = useFolders();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folderModal, setFolderModal] = useState(null); // 'edit' | 'sub'

  const folder = byId.get(id);
  const subFolders = useMemo(() => findChildren(tree, id), [tree, id]);
  const crumbs = (folder?.path || '').split('/').filter(Boolean);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notes', { folder: id, limit: 100, sort: '-updatedAt' });
      setNotes(data.notes || []);
    } catch (e) {
      toast.error(e.message);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (!foldersLoading && !folder) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Folder nahi mila"
        description="Shayad ye delete ho gaya hai ya link purana hai."
        action={
          <Button variant="outline" onClick={() => navigate('/folders')}>
            Saare folders dekho
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* breadcrumb */}
      <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted">
        <Link to="/folders" className="inline-flex items-center gap-1 hover:text-brand-700">
          <Home size={13} /> Folders
        </Link>
        {crumbs.map((c, i) => (
          <span key={`${c}-${i}`} className="inline-flex items-center gap-1.5">
            <ChevronRight size={13} className="text-ink-soft" />
            <span className={cn(i === crumbs.length - 1 && 'font-semibold text-ink')}>{c}</span>
          </span>
        ))}
      </nav>

      <PageHeader
        title={folder?.name || 'Folder'}
        subtitle={loading ? 'Loading...' : `${pluralize(notes.length, 'note')}${subFolders.length ? ` · ${pluralize(subFolders.length, 'subfolder')}` : ''}`}
        actions={
          <>
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/folders')} className="hidden xl:inline-flex">
              All folders
            </Button>
            <Button variant="outline" icon={FolderOpen} onClick={() => setFolderModal('sub')}>
              New subfolder
            </Button>
            <Button icon={Plus} onClick={() => navigate(`/notes/new?folder=${id}`)}>
              New Note
            </Button>
            <Menu trigger={<IconButton icon={MoreVertical} label="Folder actions" />} menuClassName="min-w-[190px]">
              <MenuItem icon={Pencil} onClick={() => setFolderModal('edit')}>
                Rename / edit
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={FolderOpen} onClick={() => setFolderModal('sub')}>
                New subfolder
              </MenuItem>
            </Menu>
          </>
        }
      />

      {/* subfolders */}
      {subFolders.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2.5 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Subfolders</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subFolders.map((c) => (
              <Link key={c.id} to={`/folders/${c.id}`} className="card card-hover flex items-center gap-3 p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${c.color}1A`, color: c.color }}>
                  <FolderOpen size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">{c.name}</p>
                  <p className="text-[12px] text-ink-muted">{pluralize(c.noteCount || 0, 'note')}</p>
                </div>
                <ChevronRight size={15} className="shrink-0 text-ink-soft" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* is folder ke notes */}
      {loading ? (
        <SkeletonList rows={5} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Is folder me koi note nahi hai"
          description="Yahan naya note banao - folder already selected rahega."
          action={
            <Button icon={Plus} onClick={() => navigate(`/notes/new?folder=${id}`)}>
              New Note
            </Button>
          }
        />
      ) : (
        <NotesTable notes={notes} onChanged={load} />
      )}

      <FolderModal open={folderModal === 'edit'} onClose={() => setFolderModal(null)} folder={folder} />
      <FolderModal open={folderModal === 'sub'} onClose={() => setFolderModal(null)} defaultParent={id} />
    </div>
  );
};

export default FolderDetail;
