'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link href="/" className="app-brand">
          <BrandMark className="app-brand__mark" />
          SceneTone
        </Link>
        <nav className="app-nav" aria-label="Primary">
          {links.map((link) => {
            const isActive = pathname === link.to || pathname.startsWith(`${link.to}/`);
            return (
              <Link
                key={link.to}
                href={link.to}
                className={isActive ? 'app-nav__link is-active' : 'app-nav__link'}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <AuthControl />
        <ThemeToggle />
        <Clock />
      </div>
    </header>
  );
}
