import { NavLink, Outlet } from 'react-router-dom'

const navigation = [{ to: '/', label: 'Integrations' }]

export function AppLayout() {
  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <aside className="shell__sidebar" aria-label="Sidebar">
        <div className="brand-block">
          <p className="brand-block__eyebrow">portier</p>
          <strong>Integration Sync Panel</strong>
          <p>
            Safe, transparent, reviewable synchronization workflows for external
            systems.
          </p>
        </div>

        <nav className="side-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive
                  ? 'side-nav__link side-nav__link--active'
                  : 'side-nav__link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="shell__content" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
