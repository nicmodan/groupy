import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const navItems = [
  { to: '/app/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/app/portals', icon: '🚪', label: 'My Portals' },
  { to: '/app/students', icon: '👥', label: 'Students' },
  { to: '/app/groups', icon: '🎲', label: 'Groups' },
];

const settingItems = [
  { to: '/app/settings', icon: '⚙️', label: 'Portal Settings' },
  { to: '/app/appearance', icon: '🎨', label: 'Appearance' },
  { to: '/app/questions', icon: '❓', label: 'Questions' },
];

export default function AppLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user?.displayName || user?.email || 'Admin';

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-ink text-paper z-50 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-6 py-7 border-b border-paper/10">
          <div className="font-syne text-xl font-extrabold">
            Group<span className="text-accent">ify</span>
          </div>
          <div className="text-[11px] text-paper/30 mt-1 tracking-wider">Admin Dashboard</div>
        </div>

        {/* User */}
        <div className="px-6 py-4 border-b border-paper/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">
              {displayName.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-semibold truncate max-w-[140px]">{displayName}</div>
              <div className="text-[11px] text-paper/40">Administrator</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="text-[10px] font-bold text-paper/25 tracking-widest uppercase px-3 mb-2">Main</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="text-[10px] font-bold text-paper/25 tracking-widest uppercase px-3 mb-2 mt-5">Settings</div>
          {settingItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-paper/10">
          <button
            onClick={handleLogout}
            className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-ink text-paper border-b border-paper/10">
          <div className="font-syne font-extrabold">Group<span className="text-accent">ify</span></div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-paper/70 hover:text-paper text-2xl"
          >☰</button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
