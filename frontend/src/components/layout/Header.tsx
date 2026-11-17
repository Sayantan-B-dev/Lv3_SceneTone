import { Link, NavLink } from 'react-router-dom';
import { AuthControl } from '@/components/auth/AuthControl';
import { BrandMark } from './BrandMark';
import { Clock } from './Clock';
import { ThemeToggle } from './ThemeToggle';

const links = [
  { to: '/blueprint', label: 'Blueprint' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/fl-studio', label: 'FL Studio' },
  { to: '/about', label: 'About' },
];

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-brand">
          <BrandMark className="app-brand__mark" />
          SceneTone
        </Link>
        <nav className="app-nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'app-nav__link is-active' : 'app-nav__link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <AuthControl />
        <ThemeToggle />
        <Clock />
      </div>
    </header>
  );
}
