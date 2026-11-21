'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { SignInButton } from '@/components/auth/SignInButton';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Window } from '@/components/ui/Window';
import { useCurrentUser } from '@/hooks/useAuth';
import { useDeleteProject, useProject, useUpdateProject } from '@/hooks/useProjects';
import { ApiError } from '@/lib/api';
import { describeError } from '@/lib/errors';
import type { Project } from '@/types';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function ProjectSettings({ project }: { project: Project }) {
  const update = useUpdateProject(project.id);
  const remove = useDeleteProject();
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [nameError, setNameError] = useState<string | null>(null);

  function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Project name is required.');
      return;
    }

    setNameError(null);
    update.mutate(trimmed);
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      return;
    }

    remove.mutate(project.id, {
      onSuccess: () => router.replace('/dashboard'),
    });
  }

  return (
    <Window title="settings.exe">
      <form className="project-settings" onSubmit={handleRename} noValidate>
        <Field label="Project name" error={nameError ?? undefined} required>
          {(props) => (
            <Input
              {...props}
              value={name}
              maxLength={120}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
            />
          )}
        </Field>
        <Button type="submit" variant="secondary" disabled={update.isPending}>
          {update.isPending ? 'Saving...' : 'Rename'}
        </Button>
      </form>
      {update.isError ? (
        <Alert variant="danger" title="Rename failed">
          {describeError(update.error)}
        </Alert>
      ) : null}
      {update.isSuccess ? <Alert variant="success">Project name saved.</Alert> : null}

      <div className="workspace-actions">
        <Button variant="ghost" type="button" onClick={handleDelete} disabled={remove.isPending}>
          {remove.isPending ? 'Deleting...' : 'Delete project'}
        </Button>
      </div>
      {remove.isError ? (
        <Alert variant="danger" title="Delete failed">
          {describeError(remove.error)}
        </Alert>
      ) : null}
    </Window>
  );
}

export function ProjectPage() {
  const params = useParams();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  const { data: user, isPending: userPending } = useCurrentUser();
  const project = useProject(user ? projectId : undefined);

  return (
    <section className="page page--narrow">
      <h1 className="page__title">PROJECT</h1>
      <p className="page__jp" lang="ja">
        プロジェクト
      </p>

      {userPending ? (
        <Window title="workspace.exe">
          <p role="status">Checking session...</p>
        </Window>
      ) : !user ? (
        <Window title="sign-in.exe">
          <p>Sign in with Google to open saved projects.</p>
          <SignInButton />
        </Window>
      ) : project.isPending ? (
        <Window title="workspace.exe">
          <p role="status">Loading project...</p>
        </Window>
      ) : project.isError ? (
        <Window title="workspace.exe">
          <Alert variant="danger" title="Project unavailable">
            {project.error instanceof ApiError && project.error.status === 404
              ? 'This project does not exist or belongs to another account.'
              : describeError(project.error)}
          </Alert>
          <Link className="button button--secondary" href="/dashboard">
            Back to projects
          </Link>
        </Window>
      ) : (
        <>
          <Window title="workspace.exe">
            <h2 className="project-title">{project.data.project.name}</h2>
            <dl className="project-meta">
              <div>
                <dt>Created</dt>
                <dd>{formatDate(project.data.project.createdAt)}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{formatDate(project.data.project.updatedAt)}</dd>
              </div>
            </dl>
            <Alert variant="info" title="Audio stays in your browser">
              Blueprints, numeric metrics and mix reports are saved to this project. The audio file
              itself is never uploaded.
            </Alert>
            <div className="workspace-actions">
              <Link
                className="button button--primary"
                href={`/blueprint?projectId=${project.data.project.id}`}
              >
                Generate blueprint
              </Link>
              <Link
                className="button button--secondary"
                href={`/analyze?projectId=${project.data.project.id}`}
              >
                Analyze audio
              </Link>
              <Link className="button button--secondary" href="/dashboard">
                Back to projects
              </Link>
            </div>
          </Window>
          <ProjectSettings project={project.data.project} />
        </>
      )}
    </section>
  );
}
