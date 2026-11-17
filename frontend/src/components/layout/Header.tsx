import { Link, NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-brand">
          SceneTone
        </Link>
        <nav className="app-nav" aria-label="Primary">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'app-nav__link is-active' : 'app-nav__link')}
          >
            Dashboard
          </NavLink>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
