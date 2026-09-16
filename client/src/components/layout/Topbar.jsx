import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu as MenuIcon, X, Plus } from 'lucide-react';
import Logo from '../brand/Logo.jsx';
import SearchBar from './SearchBar.jsx';
import UserMenu from './UserMenu.jsx';
import SidebarContent from './Sidebar.jsx';
import { IconButton, default as Button } from '../ui/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const Topbar = () => {
  const [drawer, setDrawer] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          {/* mobile: drawer toggle + logo */}
          <button
            onClick={() => setDrawer(true)}
            className="rounded-[10px] p-2 text-ink-muted transition hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon size={20} />
          </button>

          <div className="lg:hidden">
            <Logo size="sm" showText={false} />
          </div>

          {/* search - desktop center, mobile neeche full width */}
          <div className="hidden flex-1 justify-center lg:flex">
            <SearchBar className="max-w-[520px]" />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button size="sm" icon={Plus} className="hidden sm:inline-flex" onClick={() => navigate('/notes/new')}>
              New Note
            </Button>

            <IconButton icon={Bell} label="Notifications" onClick={() => toast.info('Notifications are coming soon')} />
            <UserMenu />
          </div>
        </div>

        {/* mobile search row */}
        <div className="border-t border-line px-4 py-2.5 lg:hidden">
          <SearchBar />
        </div>
      </header>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDrawer(false)} />
          <aside className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto bg-white pb-8 shadow-pop animate-fade-in">
            <div className="flex items-center justify-between px-4 py-4">
              <Logo size="sm" />
              <button onClick={() => setDrawer(false)} className="rounded-lg p-1.5 text-ink-soft hover:bg-slate-100" aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Topbar;
