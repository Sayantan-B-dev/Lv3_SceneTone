import { ApiStatus } from '@/components/ui/ApiStatus';
import { Card } from '@/components/ui/Card';

export function DashboardPage() {
  return (
    <section className="page">
      <p className="eyebrow">Workspace</p>
      <h1>Projects</h1>
      <p className="page__lede">
        Project CRUD, scene blueprints, audio analysis and mix reports are planned for later phases.
        No project data is stored yet.
      </p>
      <ApiStatus />
      <Card>
        <h2>No projects yet</h2>
        <p className="text-muted">
          The project list and creation flow will connect to the authenticated API in a later phase.
        </p>
      </Card>
    </section>
  );
}
