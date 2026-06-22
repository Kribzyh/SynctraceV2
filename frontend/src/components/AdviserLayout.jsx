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
        <p className="sidebar__brand-tag">ADVISER PORTAL</p>
      </div>
    </div>
  )
}

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/adviser/dashboard', label: 'Dashboard', icon: 'dashboard', end: true },
    ],
  },
]

function NavIcon({ name }) {
  const icons = {
    dashboard: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  }
  return icons[name] ?? null
}

export default function AdviserLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <SidebarLogo />

        <nav className="sidebar__nav">
          {navSections.map((section) => (
            <div key={section.label} className="sidebar__section">
              <p className="sidebar__section-label">{section.label}</p>
              <ul>
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                      }
                      end={item.end}
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
            Logout
          </NavLink>
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  )
}
