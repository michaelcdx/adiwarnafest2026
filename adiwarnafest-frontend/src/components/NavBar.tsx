import { NavLink } from 'react-router-dom'

function NavBar() {
  return (
    <header className="nav-shell">
      <nav className="nav">
        <div className="brand">Adiwarna Fest</div>
        <div className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/competition"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Competition
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Map
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

export default NavBar
