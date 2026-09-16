import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar.jsx';
import SidebarContent from './Sidebar.jsx';
import Logo from '../brand/Logo.jsx';
import { FoldersProvider } from '../../context/FoldersContext.jsx';
import ShortcutsModal from '../common/ShortcutsModal.jsx';

/** Layout for the logged-in app: fixed sidebar (desktop) + topbar + content */
const AppShell = () => {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // global hotkeys: Ctrl+K focuses search, Ctrl+/ opens the shortcuts help
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      } else if (key === '/') {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
  <FoldersProvider>
    <div className="min-h-screen bg-canvas">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col overflow-y-auto border-r border-line bg-white pb-8 lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>
        <SidebarContent />
      </aside>

      <div className="lg:pl-[264px]">
        <Topbar onOpenShortcuts={() => setShortcutsOpen(true)} />
        <main className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  </FoldersProvider>
  );
};

export default AppShell;
