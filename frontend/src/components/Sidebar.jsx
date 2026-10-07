import { NavLink } from 'react-router-dom'
import { Home, ClipboardList, BarChart3, Sparkles, TrendingUp, Brain, LogOut, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/assessment', label: 'Assessment', icon: ClipboardList },
  { to: '/results', label: 'Results', icon: BarChart3 },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/insights', label: 'AI Insights', icon: Brain },
]

export default function Sidebar() {
  const { logout, user } = useAuth()

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Moon size={18} /></div>
        <div>
          <div className="brand-name">MindBalance</div>
          <div className="brand-sub">Digital Wellness</div>
        </div>
      </div>

      <nav className="nav-links">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && <div className="sidebar-user">{user.name}</div>}
        <button className="nav-link logout-btn" onClick={logout}>
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 232px;
          flex-shrink: 0;
          background: var(--surface);
          border-right: 1px solid var(--border);
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px 26px; }
        .brand-mark {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--primary); color: #fff;
          display: flex; align-items: center; justify-content: center;
        }
        .brand-name { font-weight: 800; font-size: 15px; }
        .brand-sub { font-size: 11.5px; color: var(--ink-faint); }
        .nav-links { display: flex; flex-direction: column; gap: 3px; flex: 1; }
        .nav-link {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 12px; border-radius: var(--radius-sm);
          color: var(--ink-soft); font-size: 14px; font-weight: 600;
          border: none; background: transparent; width: 100%; text-align: left;
        }
        .nav-link:hover { background: var(--surface-tint); }
        .nav-link.active { background: var(--primary-tint); color: var(--primary-dark); }
        .sidebar-footer { border-top: 1px solid var(--border); padding-top: 12px; margin-top: 8px; }
        .sidebar-user { font-size: 12.5px; color: var(--ink-faint); padding: 0 12px 8px; }
        .logout-btn { color: var(--ink-soft); }
      `}</style>
    </aside>
  )
}
