
import { NavLink } from 'react-router-dom'
import {
  Home,
  ClipboardList,
  BarChart3,
  Sparkles,
  TrendingUp,
  LogOut,
  Moon
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/assessment', label: 'Assessment', icon: ClipboardList },
  { to: '/results', label: 'Results', icon: BarChart3 },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
]

export default function Sidebar() {
  const { logout, user } = useAuth()

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="brand">
        <div className="brand-mark">
          <Moon size={18} />
        </div>

        <div>
          <div className="brand-name">MindBalance</div>
          <div className="brand-sub">Digital Wellness</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-links">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-link${isActive ? ' active' : ''}`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">

        {user && (
          <div className="sidebar-user">
            {user.name}
          </div>
        )}

        <button
          className="nav-link logout-btn"
          onClick={logout}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>

      </div>

      <style>{`

        .sidebar {
          width: 232px;
          min-width: 232px;
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

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 8px 26px;
        }

        .brand-mark {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 10px;

          background: var(--primary);
          color: #fff;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-name {
          font-weight: 800;
          font-size: 15px;
        }

        .brand-sub {
          font-size: 11.5px;
          color: var(--ink-faint);
        }

        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 11px;

          padding: 10px 12px;
          border-radius: var(--radius-sm);

          color: var(--ink-soft);
          font-size: 14px;
          font-weight: 600;

          border: none;
          background: transparent;

          width: 100%;
          text-align: left;
          white-space: nowrap;
          text-decoration: none;
        }

        .nav-link:hover {
          background: var(--surface-tint);
        }

        .nav-link.active {
          background: var(--primary-tint);
          color: var(--primary-dark);
        }

        .sidebar-footer {
          border-top: 1px solid var(--border);
          padding-top: 12px;
          margin-top: 8px;
        }

        .sidebar-user {
          font-size: 12.5px;
          color: var(--ink-faint);
          padding: 0 12px 8px;
          overflow-wrap: anywhere;
        }

        .logout-btn {
          color: var(--ink-soft);
        }

        /* Tablet and mobile */

        @media (max-width: 900px) {

          .sidebar {
            width: 100%;
            min-width: 0;
            height: auto;
            min-height: auto;

            position: relative;
            top: auto;

            padding: 14px 16px;

            border-right: none;
            border-bottom: 1px solid var(--border);
          }

          .brand {
            padding: 2px 6px 14px;
          }

          .nav-links {
            flex-direction: row;
            flex: none;

            width: 100%;
            gap: 6px;

            overflow-x: auto;
            overflow-y: hidden;

            padding: 4px 0 10px;

            scrollbar-width: thin;
          }

          .nav-link {
            width: auto;
            flex: 0 0 auto;
            padding: 10px 12px;
            font-size: 13px;
          }

          .sidebar-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;

            margin-top: 4px;
            padding-top: 10px;
          }

          .sidebar-user {
            padding: 0;
          }

          .logout-btn {
            width: auto;
          }
        }

        @media (max-width: 480px) {

          .sidebar {
            padding: 12px 12px;
          }

          .brand {
            padding-bottom: 10px;
          }

          .brand-name {
            font-size: 14px;
          }

          .nav-links {
            gap: 5px;
          }

          .nav-link {
            padding: 9px 10px;
            font-size: 12px;
            gap: 7px;
          }

          .nav-link svg {
            width: 15px;
            height: 15px;
          }
        }

      `}</style>

    </aside>
  )
}
