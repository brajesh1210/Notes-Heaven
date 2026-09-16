import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, FileText, MoreVertical, Pencil, Trash2, ChevronRight, Inbox } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button, { IconButton } from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Menu, { MenuItem, MenuDivider } from '../components/ui/Menu.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import FolderModal from '../components/folders/FolderModal.jsx';
import { useFolders } from '../context/FoldersContext.jsx';
import { cn, pluralize } from '../lib/utils.js';

/** Folders overview - top level folders + uncategorized */
const Folders = () => {
  const { tree, uncategorized, loading, deleteFolder } = useFolders();

  const [createOpen, setCreateOpen] = useState(false);
  const [parentForNew, setParentForNew] = useState(null);
  const [editFolder, setEditFolder] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const totalFolders = useMemo(() => {
    const count = (nodes) => nodes.reduce((acc, n) => acc + 1 + count(n.children || []), 0);
    return count(tree);
  }, [tree]);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteFolder(confirmDelete.id, 'trash');
      setConfirmDelete(null);
    } finally {
      setBusy(false);
    }
  };

  const openCreate = (parentId = null) => {
    setParentForNew(parentId);
    setCreateOpen(true);
  };

  const FolderCard = ({ folder }) => (
    <div className="card card-hover group relative p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${folder.color}1A`, color: folder.color }}>
          <FolderOpen size={18} />
        </span>

        <Link to={`/folders/${folder.id}`} className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-ink group-hover:text-brand-700">{folder.name}</p>
          <p className="mt-0.5 text-[12.5px] text-ink-muted">
            {pluralize(folder.noteCount || 0, 'note')}
            {folder.children?.length ? ` · ${folder.children.length} subfolder${folder.children.length > 1 ? 's' : ''}` : ''}
          </p>
        </Link>

        <Menu trigger={<IconButton icon={MoreVertical} label="Folder actions" size={17} />} menuClassName="min-w-[180px]">
          <MenuItem icon={Pencil} onClick={() => setEditFolder(folder)}>
            Rename / edit
          </MenuItem>
          <MenuItem icon={Plus} onClick={() => openCreate(folder.id)}>
            New subfolder
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={Trash2} danger onClick={() => setConfirmDelete(folder)}>
            Delete folder
          </MenuItem>
        </Menu>
      </div>

      {folder.children?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
          {folder.children.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              to={`/folders/${c.id}`}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11.5px] font-medium text-ink-muted transition hover:bg-brand-50 hover:text-brand-700"
            >
              <ChevronRight size={11} /> {c.name}
            </Link>
          ))}
          {folder.children.length > 4 && <span className="chip-muted">+{folder.children.length - 4} more</span>}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Folders"
        subtitle={loading ? 'Loading...' : `${totalFolders} folder${totalFolders === 1 ? '' : 's'} · nested folders supported`}
        actions={
          <Button icon={Plus} onClick={() => openCreate(null)}>
            New Folder
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card h-[104px] animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : tree.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Koi folder nahi hai"
          description="Folders se notes organized rehte hain. Class 12, Physics, Personal - jaise chaho banao, nested bhi."
          action={
            <Button icon={Plus} onClick={() => openCreate(null)}>
              Create first folder
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tree.map((f) => (
              <FolderCard key={f.id} folder={f} />
            ))}

            {uncategorized > 0 && (
              <Link to="/notes" className={cn('card card-hover flex items-center gap-3 p-4')}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-ink-muted">
                  <Inbox size={18} />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-ink">Uncategorized</p>
                  <p className="text-[12.5px] text-ink-muted">{pluralize(uncategorized, 'note')}</p>
                </div>
              </Link>
            )}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
            <FileText size={16} className="mt-0.5 shrink-0 text-brand-700" />
            <p className="text-[13px] leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">Tip:</span> folder ke andar jaake "New subfolder" se nesting banao (jaise
              Class 12 → Physics → Optics). Folder delete karne par uske notes trash me chale jate hain - 5 din tak recover kar sakte ho.
            </p>
          </div>
        </>
      )}

      <FolderModal open={createOpen} onClose={() => setCreateOpen(false)} defaultParent={parentForNew} />
      <FolderModal open={Boolean(editFolder)} onClose={() => setEditFolder(null)} folder={editFolder} />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={busy}
        title={`"${confirmDelete?.name}" delete karna hai?`}
        description="Folder ke saare notes trash me chale jayenge (5 din me auto-delete). Subfolders bhi delete ho jayenge."
        confirmLabel="Delete folder"
      />
    </div>
  );
};

export default Folders;
