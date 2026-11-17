import { Link, Outlet } from 'react-router-dom';
import { Header } from './Header';

export function AppShell() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <div className="app-shell">
        <Header />
        <main id="main" className="app-main" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="app-footer">
          <p>
            A E S T H E T I C · SceneTone · 2026 · <Link to="/dashboard">Workspace</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
