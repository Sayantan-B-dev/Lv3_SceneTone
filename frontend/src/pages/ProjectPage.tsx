import { Link, useParams } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Window } from '@/components/ui/Window';

export function ProjectPage() {
  const { projectId } = useParams();

  return (
    <section className="page page--narrow">
      <h1 className="page__title">PROJECT</h1>
      <p className="page__jp" lang="ja">
        プロジェクト
      </p>

      <Window title="workspace.exe">
        <p>Project id: {projectId ?? 'unknown'}</p>
        <Alert variant="warning" title="Scaffold placeholder">
          The project composer, blueprint view, local analysis and mix report will be built in later
          phases.
        </Alert>
        <div className="workspace-actions">
          <Link className="button button--secondary" to="/dashboard">
            Back to projects
          </Link>
        </div>
      </Window>
    </section>
  );
}
