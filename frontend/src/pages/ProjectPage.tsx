import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';

export function ProjectPage() {
  const { projectId } = useParams();

  return (
    <section className="page">
      <p className="eyebrow">Project</p>
      <h1>Project workspace</h1>
      <p className="page__lede">
        The project composer, blueprint view, local audio analysis and mix report will be built in
        later phases.
      </p>
      <Card>
        <h2>Scaffold placeholder</h2>
        <p className="text-muted">Project id: {projectId ?? 'unknown'}</p>
      </Card>
    </section>
  );
}
