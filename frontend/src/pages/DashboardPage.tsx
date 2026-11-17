import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { ApiStatus } from '@/components/ui/ApiStatus';
import { Window } from '@/components/ui/Window';

export function DashboardPage() {
  return (
    <section className="page page--narrow">
      <h1 className="page__title">PROJECTS</h1>
      <p className="page__jp" lang="ja">
        計画 ワークスペース
      </p>

      <Window title="projects.exe">
        <ApiStatus />
        <p className="text-muted">
          Project CRUD, saved scene blueprints, audio analysis and mix reports arrive in later
          phases. No project data is stored yet.
        </p>
        <Alert variant="info" title="Workspace preview">
          This is the authenticated workspace shell. Google sign-in and MongoDB-backed projects are
          not connected in this build.
        </Alert>
        <div className="workspace-actions">
          <Link className="button button--secondary" to="/blueprint">
            Open a sample blueprint
          </Link>
          <Link className="button button--ghost" to="/">
            Back home
          </Link>
        </div>
      </Window>
    </section>
  );
}
