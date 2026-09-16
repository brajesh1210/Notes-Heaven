import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Home, Files, FolderOpen, Trash2, Plus, ChevronRight, ChevronDown, Folder, Star } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { useFolders } from '../../context/FoldersContext.jsx';
import FolderModal from '../folders/FolderModal.jsx';

const NavItem = ({ to, icon: Icon, label, badge, end = false, onNavigate }) => (
  <NavLink to={to} end={end} onClick={onNavigate} className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}>
    {({ isActive }) => (
      <>
        <Icon size={17} className={cn('shrink-0', isActive ? 'text-brand-700' : 'text-ink-soft')} />
        <span className="flex-1 truncate">{label}</span>
        {badge > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">{badge}</span>}
      </>
    )}
  </NavLink>
);

/** Nested folder tree - expand/collapse + note counts */
const FolderNode = ({ node, level = 0, onNavigate }) => {
  const [open, setOpen] = useState(level === 0);
  const hasChildren = node.children?.length > 0;
  const location = useLocation();
  const isActive = location.pathname === `/folders/${node.id}`;

  return (
    <div>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn('mr-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-ink-soft transition hover:bg-slate-100', !hasChildren && 'invisible')}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <NavLink
          to={`/folders/${node.id}`}
          onClick={onNavigate}
          style={{ paddingLeft: 8 + level * 10 }}
          className={cn('sidebar-link flex-1 py-2', isActive && 'sidebar-link-active')}
        >
          <Folder size={16} className={cn('shrink-0', isActive && 'text-brand-700')} style={{ color: !isActive ? node.color : undefined }} />
          <span className="flex-1 truncate">{node.name}</span>
          {node.noteCount > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">{node.noteCount}</span>
          )}
        </NavLink>
      </div>

      {open && hasChildren && (
        <div className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <FolderNode key={child.id} node={child} level={level + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};

const SidebarContent = ({ onNavigate }) => {
  const { tree, folders, uncategorized, loading } = useFolders();
  const [folderModal, setFolderModal] = useState(false);

  return (
    <>
      <nav className="space-y-1 px-3">
        <NavItem to="/dashboard" icon={Home} label="Home" onNavigate={onNavigate} />
        <NavItem to="/notes" icon={Files} label="All Notes" onNavigate={onNavigate} />
        <NavItem to="/folders" icon={FolderOpen} label="Folders" onNavigate={onNavigate} />
        <NavItem to="/trash" icon={Trash2} label="Trash" onNavigate={onNavigate} />
      </nav>

      <div className="mt-6 px-3">
        <div className="flex items-center justify-between px-3 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Folders</p>
          <button
            onClick={() => setFolderModal(true)}
            className="rounded-md p-1 text-ink-soft transition hover:bg-slate-100 hover:text-ink"
            aria-label="New folder"
            title="New folder"
          >
            <Plus size={15} />
          </button>
        </div>

        <div className="space-y-0.5">
          {loading ? (
            <div className="space-y-2 px-3 py-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : folders.length === 0 ? (
            <p className="px-3 py-2 text-[13px] text-ink-soft">No folders yet.</p>
          ) : (
            <>
              {tree.map((node) => (
                <FolderNode key={node.id} node={node} onNavigate={onNavigate} />
              ))}

              {uncategorized > 0 && (
                <NavLink
                  to="/notes"
                  onClick={onNavigate}
                  className={({ isActive }) => cn('sidebar-link py-2', isActive && 'sidebar-link-active')}
                >
                  <Star size={16} className="shrink-0 text-ink-soft" />
                  <span className="flex-1 truncate">Uncategorized</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">{uncategorized}</span>
                </NavLink>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => setFolderModal(true)}
          className="mt-2 flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-ink-muted transition hover:bg-slate-100 hover:text-ink"
        >
          <Plus size={16} className="text-ink-soft" />
          New Folder
        </button>
      </div>

      <FolderModal open={folderModal} onClose={() => setFolderModal(false)} />
    </>
  );
};

export default SidebarContent;
