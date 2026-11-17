import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tag } from '@/components/ui/Tag';
import { Textarea } from '@/components/ui/Textarea';
import { Window } from '@/components/ui/Window';
import { useGenerateBlueprint } from '@/hooks/useAi';
import { blueprintToMarkdown, downloadJson, downloadMarkdown, exportBaseName } from '@/lib/export';
import type { SoundscapeBlueprint } from '@/types';

interface FormState {
  scene: string;
  duration: string;
  style: string;
  platform: string;
  constraint: string;
}

const INITIAL_FORM: FormState = {
  scene:
    'A lone lighthouse keeper in a storm, rain on glass, distant thunder, a fragile hope building toward dawn.',
  duration: '2',
  style: 'Cinematic tension',
  platform: 'Film / video',
  constraint: 'No percussion in the first 30 seconds',
};

function percent(value: number): number {
  return Math.round(value * 100);
}

function listBox(label: string, items: string[]) {
  return (
    <div className="blueprint-box" key={label}>
      <b className="blueprint-box__label">{label}</b>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function BlueprintResult({
  blueprint,
  model,
}: {
  blueprint: SoundscapeBlueprint;
  model: string | null;
}) {
  const title = blueprint.title;

  return (
    <>
      <div className="blueprint-meta">
        {blueprint.bpm ? <Tag>{blueprint.bpm} BPM</Tag> : null}
        {blueprint.key ? <Tag variant="cyan">{blueprint.key}</Tag> : null}
        <Tag variant="green">{blueprint.mood.primary}</Tag>
        {blueprint.mood.secondary.map((mood) => (
          <Tag variant="yellow" key={mood}>
            {mood}
          </Tag>
        ))}
      </div>

      <p>{blueprint.summary}</p>

      <div>
        {blueprint.arrangement.map((section) => (
          <div className="energy-row" key={section.name}>
            <strong>{section.name}</strong>
            <div className="energy-bar">
              <span
                className="energy-row__fill"
                style={{ width: `${percent(section.energy)}%` }}
                aria-hidden="true"
              />
            </div>
            <span>{section.bars ? `${section.bars} bars` : `${percent(section.energy)}%`}</span>
          </div>
        ))}
      </div>

      <div className="blueprint-boxes">
        {listBox(
          'LAYERS',
          blueprint.layers.map((layer) => `${layer.name} — ${layer.role}: ${layer.description}`),
        )}
        {listBox('FOLEY', blueprint.foleyAndAmbience)}
        {listBox('AUTOMATION', blueprint.automation)}
        {listBox('TRANSITIONS', blueprint.transitions)}
        {listBox('NOTES', blueprint.productionNotes)}
        {listBox('ASSUMPTIONS', blueprint.assumptions)}
        {listBox('UNCERTAINTY', blueprint.uncertainty)}
        {listBox(
          'FL STUDIO CHAIN',
          blueprint.flStudioChain.map(
            (step) => `${step.plugin} — ${step.purpose} (${step.placement}; ${step.startingPoint})`,
          ),
        )}
      </div>

      <div className="cta-row">
        <Button
          type="button"
          variant="secondary"
          onClick={() => downloadJson(`${exportBaseName(title)}-blueprint.json`, blueprint)}
        >
          Save JSON
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            downloadMarkdown(
              `${exportBaseName(title)}-blueprint.md`,
              blueprintToMarkdown(blueprint, {
                model,
                generatedAt: new Date().toISOString(),
              }),
            )
          }
        >
          Save Markdown
        </Button>
      </div>
      <p className="note">
        Exports are written locally in your browser. Plugin settings are starting points, not a DAW
        project — SceneTone never creates `.flp` files.
      </p>
    </>
  );
}

export function BlueprintPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') ?? undefined;
  const generate = useGenerateBlueprint();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [blueprint, setBlueprint] = useState<SoundscapeBlueprint | null>(null);
  const [model, setModel] = useState<string | null>(null);

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const scene = form.scene.trim();
    if (scene.length < 10) {
      return;
    }

    generate.mutate(
      {
        sceneDescription: scene,
        durationSeconds: Number(form.duration) * 60,
        styleDirection: form.style,
        platform: form.platform,
        ...(form.constraint.trim() ? { constraints: form.constraint.trim() } : {}),
        ...(projectId ? { projectId } : {}),
      },
      {
        onSuccess: (data) => {
          setBlueprint(data.blueprint);
          setModel(data.model);
        },
      },
    );
  };

  return (
    <section className="page">
      <h1 className="page__title">BLUEPRINT</h1>
      <p className="page__jp" lang="ja">
        計画
      </p>

      <div className="grid grid--12">
        <Window title="brief.exe">
          <form onSubmit={handleSubmit} noValidate>
            <Field label="Scene" hint="10-4000 characters. Sent to the AI provider.">
              {(fieldProps) => (
                <Textarea
                  {...fieldProps}
                  value={form.scene}
                  maxLength={4000}
                  onChange={(event) => update('scene', event.target.value)}
                />
              )}
            </Field>

            <div className="form-grid">
              <Field label="Length">
                {(fieldProps) => (
                  <Select
                    {...fieldProps}
                    value={form.duration}
                    onChange={(event) => update('duration', event.target.value)}
                  >
                    <option value="1">1 min</option>
                    <option value="2">2 min</option>
                    <option value="3">3 min</option>
                    <option value="5">5 min</option>
                  </Select>
                )}
              </Field>
              <Field label="Style">
                {(fieldProps) => (
                  <Select
                    {...fieldProps}
                    value={form.style}
                    onChange={(event) => update('style', event.target.value)}
                  >
                    <option>Cinematic tension</option>
                    <option>Ambient drone</option>
                    <option>Lo-fi dusk</option>
                    <option>Sound-design heavy</option>
                  </Select>
                )}
              </Field>
            </div>

            <div className="form-grid">
              <Field label="Platform">
                {(fieldProps) => (
                  <Select
                    {...fieldProps}
                    value={form.platform}
                    onChange={(event) => update('platform', event.target.value)}
                  >
                    <option>Film / video</option>
                    <option>Game</option>
                    <option>Podcast</option>
                    <option>Streaming release</option>
                  </Select>
                )}
              </Field>
              <Field label="Constraint">
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    value={form.constraint}
                    maxLength={1000}
                    onChange={(event) => update('constraint', event.target.value)}
                  />
                )}
              </Field>
            </div>

            <div className="cta-row">
              <Button
                type="submit"
                variant="primary"
                disabled={generate.isPending || form.scene.trim().length < 10}
              >
                {generate.isPending ? 'Generating...' : 'Generate blueprint'}
              </Button>
            </div>
          </form>

          {generate.isError ? (
            <Alert variant="danger" title="Blueprint not generated">
              {generate.error.message}
            </Alert>
          ) : null}
        </Window>

        <Window title="blueprint.exe">
          <p className="visually-hidden" role="status">
            {generate.isPending
              ? 'Generating blueprint.'
              : blueprint
                ? `Blueprint ready: ${blueprint.title}.`
                : 'No blueprint generated yet.'}
          </p>

          {!blueprint && !generate.isPending ? (
            <>
              <p className="note">
                No blueprint yet. Nothing is generated locally and no sample is shown as AI output.
              </p>
              <p className="text-muted">
                Submitting the brief sends the scene description to the AI provider from the
                server. Audio is never uploaded.
              </p>
            </>
          ) : null}

          {generate.isPending ? <p role="status">Waiting for the AI provider...</p> : null}

          {blueprint ? <BlueprintResult blueprint={blueprint} model={model} /> : null}
        </Window>
      </div>
    </section>
  );
}
