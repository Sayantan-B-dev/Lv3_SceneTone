import type { ReactNode } from 'react';
import Link from 'next/link';
import { PageGuide } from '@/components/guide/PageGuide';
import { BrandMark } from './BrandMark';
import { Header } from './Header';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <div className="app-shell">
        <Header />
        <main id="main" className="app-main" tabIndex={-1}>
          {children}
        </main>
        <footer className="app-footer">
          <p>
            <BrandMark className="app-footer__mark" />
            A E S T H E T I C · SceneTone · 2026 · <Link href="/dashboard">Workspace</Link>
          </p>
        </footer>
      </div>
      <PageGuide />
    </>
  );
}
