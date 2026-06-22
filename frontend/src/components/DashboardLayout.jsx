import { NavLink } from 'react-router-dom'
import './DashboardLayout.css'

function SidebarLogo() {
  return (
    <div className="sidebar__brand">
      <img
        src="/images/citu-logo.png"
        alt="Cebu Institute of Technology - University"
        className="sidebar__brand-img"
      />
      <div>
        <p className="sidebar__brand-name">SyncTrace</p>
        <p className="sidebar__brand-tag">STUDENT PORTAL</p>
      </div>
    </div>
  )
}

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/workspace', label: 'Workspace', icon: 'workspace' },
    ],
  },
  {
    label: 'ARTIFACTS',
    items: [
      { to: '/artifacts', label: 'Artifact Upload', icon: 'artifacts' },
    ],
  },
  {
    label: 'TRACEABILITY HUB',
    id: 'trace-tools',
    items: [
      { to: '/mapping', label: 'Mapping', icon: 'mapping' },
      { to: '/matrix', label: 'Matrix', icon: 'matrix' },
      { to: '/continuity', label: 'Gap Analysis', icon: 'continuity' },
      { to: '/analysis', label: 'AI Engine', icon: 'analysis' },
    ],
  },
  {
    label: 'REPORTS',
    items: [
      { to: '/reports', label: 'Reports', icon: 'reports' },
    ],
  },
]

function NavIcon({ name, className }) {
  const icons = {
    dashboard: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    workspace: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    artifacts: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    matrix: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    mapping: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <path d="M8.5 8.5l7 7" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
      </svg>
    ),
    continuity: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    analysis: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.4V11h4a8 8 0 1 1-8 8 8 8 0 0 1-8-8h4V9.4C6.8 8.8 6 7.5 6 6a4 4 0 0 1 4-4z" />
      </svg>
    ),
    reports: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    logout: (
      <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  }
  return icons[name] ?? null
}

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <SidebarLogo />

        <nav className="sidebar__nav">
          {navSections.map((section) => (
            <div key={section.label ?? section.id} className="sidebar__section">
              {section.label ? (
                <p className="sidebar__section-label">{section.label}</p>
              ) : null}
              <ul>
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                      }
                      end={item.to === '/dashboard'}
                    >
                      <NavIcon name={item.icon} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar__footer">
          <NavLink to="/login" className="sidebar__logout">
            <NavIcon name="logout" className="sidebar__logout-icon" />
            Logout
          </NavLink>
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  )
}