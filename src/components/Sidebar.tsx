import { NavLink } from 'react-router-dom'
import { ClipboardCheck, LayoutDashboard, Layers, Settings } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Tasks', icon: ClipboardCheck },
  { to: '/projects', label: 'Projects', icon: Layers, disabled: true },
  { to: '/brief', label: 'Brief', icon: LayoutDashboard, disabled: true },
  { to: '/settings', label: 'Settings', icon: Settings, disabled: true },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">🌀</div>
        <div>
          <p className="sidebar__title">Mission Control</p>
          <p className="sidebar__subtitle">Agent Ops</p>
        </div>
      </div>
      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon
          if (item.disabled) {
            return (
              <div key={item.to} className="sidebar__link sidebar__link--disabled">
                <span className="sidebar__icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                <span>{item.label}</span>
              </div>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                ['sidebar__link', isActive && 'sidebar__link--active'].filter(Boolean).join(' ')
              }
            >
              <span className="sidebar__icon" aria-hidden="true">
                <Icon size={16} />
              </span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
