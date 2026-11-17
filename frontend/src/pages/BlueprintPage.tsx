import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tag } from '@/components/ui/Tag';
import { Textarea } from '@/components/ui/Textarea';
import { Window } from '@/components/ui/Window';

const SECTION_NAMES = [
  'Establish',
  'Rising unease',
  'Storm closes in',
  'Breaking point',
  'Release',
  'Dawn tail',
];

const STYLE_SETTINGS: Record<string, { key: string; bpm: number }> = {
  'Cinematic tension': { key: 'D minor', bpm: 72 },
  'Ambient drone': { key: 'C Lydian', bpm: 58 },
  'Lo-fi dusk': { key: 'F major', bpm: 84 },
  'Sound-design heavy': { key: 'E phrygian', bpm: 66 },
};

interface SampleSection {
  name: string;
  start: number;
  energy: number;
}

interface SampleBlueprint {
  title: string;
  bpm: number;
  key: string;
  durationMin: number;
  style: string;
  platform: string;
  sections: SampleSection[];
  layers: string[];
  foley: string[];
  automation: string[];
  transitions: string[];
  notes: string[];
  assumptions: string[];
}

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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hashScene(value: string): number {
  return [...value].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7);
}

function buildSampleBlueprint(form: FormState): SampleBlueprint {
  const scene = form.scene.trim() || 'Untitled scene';
  const durationMin = Number(form.duration);
  const setting = STYLE_SETTINGS[form.style] ?? STYLE_SETTINGS['Cinematic tension'];
  const sectionCount = Math.min(6, 3 + durationMin);
  const hash = hashScene(scene);
  const words = scene.toLowerCase().match(/[a-z]{5,}/g) ?? ['room'];
  const firstWord = words[0];
  const secondWord = words[Math.min(words.length - 1, 2)];

  const sections = Array.from({ length: sectionCount }, (_, index) => {
    const position = index / (sectionCount - 1);
    return {
      name: SECTION_NAMES[Math.round((index * 5) / (sectionCount - 1))],
      start: Math.round((index * durationMin * 60) / sectionCount),
      energy: Math.round(
        clamp(
          0.25 +
            0.6 * Math.sin(Math.PI * Math.min(1, position * 1.12)) +
            ((hash >> index) & 7) / 60,
          0.12,
          0.98,
        ) * 100,
      ),
    };
  });

  return {
    title: scene.length > 30 ? `${scene.slice(0, 30)}...` : scene,
    bpm: setting.bpm,
    key: setting.key,
    durationMin,
    style: form.style,
    platform: form.platform,
    sections,
    layers: ['Low drone bed', 'Textural pad', 'Pulse motif', `Ambience around "${firstWord}"`],
    foley: [`Close detail for "${firstWord}"`, `Distant layer for "${secondWord}"`, 'Room tone'],
    automation: [
      'Slow low-pass opening through the build',
      'Reverb send rising into the breaking point',
      'Narrow stereo in tension, widen at release',
    ],
    transitions: [
      'Reverse swell into section 3',
      'Silence gap before release',
      'Long tail at the end',
    ],
    notes: [
      'Keep the first section sparse',
      'Save the loudest moment for the breaking point',
      form.constraint.trim() ? `Constraint: ${form.constraint.trim()}` : 'No constraints',
    ],
    assumptions: ['Tempo and key are starting suggestions'],
  };
}

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function BlueprintPage() {
  const exportNoteId = useId();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [blueprint, setBlueprint] = useState<SampleBlueprint>(() =>
    buildSampleBlueprint(INITIAL_FORM),
  );
  const [revision, setRevision] = useState(0);

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBlueprint(buildSampleBlueprint(form));
    setRevision((current) => current + 1);
  };

  const boxes = [
    ['LAYERS', blueprint.layers],
    ['FOLEY', blueprint.foley],
    ['AUTOMATION', blueprint.automation],
    ['TRANSITIONS', blueprint.transitions],
    ['NOTES', blueprint.notes],
    ['ASSUMPTIONS', blueprint.assumptions],
  ] as const;

  return (
    <section className="page">
      <h1 className="page__title">BLUEPRINT</h1>
      <p className="page__jp" lang="ja">
        計画
      </p>

      <div className="grid grid--12">
        <Window title="brief.exe">
          <form onSubmit={handleSubmit}>
            <Field label="Scene">
              {(fieldProps) => (
                <Textarea
                  {...fieldProps}
                  value={form.scene}
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
                    onChange={(event) => update('constraint', event.target.value)}
                  />
                )}
              </Field>
            </div>

            <div className="cta-row">
              <Button type="submit" variant="primary">
                Generate blueprint
              </Button>
            </div>
          </form>
        </Window>

        <Window title="blueprint.exe">
          <p className="visually-hidden" role="status">
            Sample blueprint refreshed ({revision}).
          </p>
          <p className="note">
            Sample data from a local template, not AI output. Nothing is sent anywhere.
          </p>
          <div className="blueprint-meta">
            <Tag>{blueprint.bpm} BPM</Tag>
            <Tag variant="cyan">{blueprint.key}</Tag>
            <Tag variant="green">{blueprint.durationMin} min</Tag>
            <Tag variant="yellow">{blueprint.platform}</Tag>
          </div>

          <div>
            {blueprint.sections.map((section) => (
              <div className="energy-row" key={`${section.name}-${section.start}`}>
                <strong>{section.name}</strong>
                <div className="energy-bar">
                  <span
                    className="energy-row__fill"
                    style={{ width: `${section.energy}%` }}
                    aria-hidden="true"
                  />
                </div>
                <span>{formatTime(section.start)}</span>
              </div>
            ))}
          </div>

          <div className="blueprint-boxes">
            {boxes.map(([label, items]) => (
              <div className="blueprint-box" key={label}>
                <b className="blueprint-box__label">{label}</b>
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="cta-row">
            <Button type="button" variant="secondary" disabled aria-describedby={exportNoteId}>
              Save JSON
            </Button>
            <Button type="button" variant="secondary" disabled aria-describedby={exportNoteId}>
              Save Markdown
            </Button>
          </div>
          <p className="note" id={exportNoteId}>
            JSON and Markdown export connect with the persistence phase. This build produces no
            files.
          </p>
        </Window>
      </div>
    </section>
  );
}
