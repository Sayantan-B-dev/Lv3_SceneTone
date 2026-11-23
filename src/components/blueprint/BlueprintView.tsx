'use client';

import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { blueprintToMarkdown, downloadJson, downloadMarkdown, exportBaseName } from '@/lib/export';
import type { SoundscapeBlueprint } from '@/types';

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

export function BlueprintView({
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
