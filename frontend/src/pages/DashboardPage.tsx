import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SignInButton } from '@/components/auth/SignInButton';
import { Alert } from '@/components/ui/Alert';
import { ApiStatus } from '@/components/ui/ApiStatus';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';
import { Window } from '@/components/ui/Window';
import { useCurrentUser } from '@/hooks/useAuth';
import { useCreateProject, useProjects } from '@/hooks/useProjects';
import { describeError } from '@/lib/errors';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const authStatus = searchParams.get('auth');
  const { data: user, isPending, isError } = useCurrentUser();
  const projects = useProjects(Boolean(user));
  const createProject = useCreateProject();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Project name is required.');
      return;
    }

    setNameError(null);
    createProject.mutate(trimmed, {
      onSuccess: () => setName(''),
    });
  }

  return (
    <section className="page page--narrow">
      <h1 className="page__title">PROJECTS</h1>
      <p className="page__jp" lang="ja">
        計画 ワークスペース
      </p>

      {authStatus === 'failed' ? (
        <Alert variant="danger" title="Google sign-in did not complete">
          The provider returned an error or the request was cancelled. Check that the authorized
          redirect URI in Google Cloud matches <code>GOOGLE_CALLBACK_URL</code>, then try again.
        </Alert>
      ) : null}
      {authStatus === 'unconfigured' ? (
        <Alert variant="warning" title="Server sign-in is not configured">
          Set <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code> and
          <code> GOOGLE_CALLBACK_URL</code> on the backend, then restart it.
        </Alert>
      ) : null}

      {isPending ? (
        <Window title="workspace.exe">
          <p role="status">Checking session...</p>
        </Window>
      ) : isError ? (
        <Window title="workspace.exe">
          <Alert variant="danger" title="Workspace unavailable">
            The API could not be reached. Start the backend and refresh.
          </Alert>
          <ApiStatus />
        </Window>
      ) : !user ? (
        <Window title="sign-in.exe">
          <p>Sign in with Google to create and manage your SceneTone projects.</p>
          <SignInButton />
          <Alert variant="info" title="Local setup">
            Google sign-in requires backend Google credentials and
            <code> VITE_GOOGLE_CLIENT_ID</code>. Until configured, the rest of the app remains
            browsable.
          </Alert>
        </Window>
      ) : (
        <Window title="projects.exe">
          <ApiStatus />
          <p className="text-muted">Signed in as {user.email}</p>

          <form className="project-create" onSubmit={handleCreate} noValidate>
            <Field label="New project" error={nameError ?? undefined} required>
              {(props) => (
                <Input
                  {...props}
                  value={name}
                  maxLength={120}
                  placeholder="Rain-lit rooftop chase"
                  onChange={(event) => {
                    setName(event.target.value);
                    if (nameError) setNameError(null);
                  }}
                />
              )}
            </Field>
            <Button type="submit" variant="primary" disabled={createProject.isPending}>
              {createProject.isPending ? 'Creating...' : 'Create project'}
            </Button>
          </form>
          {createProject.isError ? (
            <Alert variant="danger" title="Could not create project">
              {describeError(createProject.error)}
            </Alert>
          ) : null}

          <div className="project-list__heading">
            <h2>YOUR PROJECTS</h2>
            <Tag variant="cyan">{projects.data?.projects.length ?? 0} saved</Tag>
          </div>

          {projects.isPending ? <p role="status">Loading projects...</p> : null}
          {projects.isError ? (
            <Alert variant="danger" title="Could not load projects">
              {describeError(projects.error)}
            </Alert>
          ) : null}
          {projects.data && projects.data.projects.length === 0 ? (
            <p className="text-muted">No projects yet. Create one above to start a scene brief.</p>
          ) : null}

          {projects.data && projects.data.projects.length > 0 ? (
            <ul className="project-list">
              {projects.data.projects.map((project) => (
                <li key={project.id}>
                  <article className="project-card">
                    <div>
                      <Link to={`/projects/${project.id}`} className="project-card__name">
                        {project.name}
                      </Link>
                      <p className="project-card__meta">
                        Updated {formatDate(project.updatedAt)}
                      </p>
                    </div>
                    <Tag variant="green">v{project.schemaVersion}</Tag>
                  </article>
                </li>
              ))}
            </ul>
          ) : null}

          <Alert variant="info" title="What is stored">
            Only project name, scene brief and future analysis/report data are saved. Audio files
            stay in your browser.
          </Alert>
        </Window>
      )}
    </section>
  );
}
