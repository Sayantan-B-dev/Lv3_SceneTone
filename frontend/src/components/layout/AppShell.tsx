import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <main id="main" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>SceneTone · soundscape production co-pilot</p>
      </footer>
    </div>
  );
}
