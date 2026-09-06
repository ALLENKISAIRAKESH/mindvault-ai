import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Brain,
  LayoutDashboard,
  MessageSquare,
  Lightbulb,
  Database,
  Shield,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/journal', icon: MessageSquare, label: 'AI Journal' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/memory', icon: Database, label: 'Memory' },
  { to: '/security', icon: Shield, label: 'Security' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-abyss)' }}>
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-void)', borderRight: '1px solid var(--color-surface)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--color-surface)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-glow"
               style={{ background: 'linear-gradient(135deg, var(--color-accent-1), var(--color-accent-3))' }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: 'var(--color-white)' }}>MindVault</h1>
            <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--color-accent-4)' }}>AI</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : ''
                }`
              }
              style={({ isActive }) => ({
                background: isActive
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.15))'
                  : 'transparent',
                color: isActive ? 'var(--color-white)' : 'var(--color-soft)',
                borderLeft: isActive ? '3px solid var(--color-accent-1)' : '3px solid transparent',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--color-surface)' }}>
          <div className="flex items-center gap-3 px-3 py-2">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                   style={{ background: 'var(--color-surface)', color: 'var(--color-accent-1)' }}>
                {(user?.displayName || user?.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-bright)' }}>
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 mt-1 rounded-xl text-sm transition-colors"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface)';
              e.currentTarget.style.color = 'var(--color-danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-muted)';
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header
          className="flex items-center gap-4 px-4 lg:px-6 py-3 sticky top-0 z-30"
          style={{
            backgroundColor: 'rgba(10, 10, 26, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-surface)',
          }}
        >
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ color: 'var(--color-soft)' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your thoughts..."
                className="input-field pl-9 py-2 text-sm"
                style={{ background: 'var(--color-surface)' }}
              />
            </div>
          </form>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
