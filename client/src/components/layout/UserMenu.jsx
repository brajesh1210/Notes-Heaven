import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, BookOpen } from 'lucide-react';
import Menu, { MenuItem, MenuDivider, MenuLabel } from '../ui/Menu.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const UserMenu = () => {
  const { user, logout, demoMode } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Menu
      trigger={
        <button className="rounded-full transition hover:opacity-90 focus:outline-none focus-visible:shadow-focus" aria-label="Account menu">
          <Avatar user={user} size={34} className="ring-2 ring-white" />
        </button>
      }
      menuClassName="min-w-[230px]"
    >
      <div className="px-3.5 py-2">
        <p className="truncate text-[13.5px] font-semibold text-ink">{user?.name}</p>
        <p className="truncate text-[12px] text-ink-muted">{user?.email}</p>
        {demoMode && (
          <span className="mt-1.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Demo mode
          </span>
        )}
      </div>

      <MenuDivider />
      <MenuLabel>Account</MenuLabel>

      <MenuItem icon={User} onClick={() => toast.info('Profile page Phase 3 me aa raha hai')}>
        Profile
      </MenuItem>
      <MenuItem icon={Settings} onClick={() => navigate('/dashboard')}>
        Preferences
      </MenuItem>
      <MenuItem
        icon={BookOpen}
        onClick={() => {
          toast.info('Notes Heaven v1.0 - MERN stack se bana 📖');
        }}
      >
        About
      </MenuItem>

      <MenuDivider />
      <MenuItem icon={LogOut} danger onClick={handleLogout}>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;
