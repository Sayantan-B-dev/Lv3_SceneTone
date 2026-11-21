'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Window } from '@/components/ui/Window';

interface Plugin {
  name: string;
  category: string;
  purpose: string;
  placement: string;
  startingPoint: string;
}

const PLUGINS: Plugin[] = [
  {
    name: 'Fruity Parametric EQ 2',
    category: 'Tone',
    purpose: 'Carve low-mid mud and tame harshness',
    placement: 'Early in the chain, before dynamics',
    startingPoint: 'Cuts of 1 to 3 dB, then A/B',
  },
  {
    name: 'Fruity Compressor',
    category: 'Dynamics',
    purpose: 'Glue layers, control short peaks',
    placement: 'After EQ, before the limiter',
    startingPoint: 'Gentle ratio, slower attack, 1 to 3 dB of reduction',
  },
  {
    name: 'Maximus',
    category: 'Dynamics',
    purpose: 'Multiband control for one misbehaving region',
    placement: 'On the bus, after tonal EQ',
    startingPoint: 'Treat only the band that needs it',
  },
  {
    name: 'Fruity Reeverb 2',
    category: 'Space',
    purpose: 'Depth and a believable room or tail',
    placement: 'Send, not on the dry signal',
    startingPoint: 'Add pre-delay, trim lows in the return',
  },
  {
    name: 'Fruity Delay 3',
    category: 'Space',
    purpose: 'Echoes and movement behind a layer',
    placement: 'Send, filtered so it stays clear',
    startingPoint: 'Sync to tempo, lower feedback',
  },
  {
    name: 'Fruity Limiter',
    category: 'Safety',
    purpose: 'Final ceiling and level control',
    placement: 'Last in the chain',
    startingPoint: 'Leave headroom, it is not a loudness fix',
  },
  {
    name: 'Fruity Soft Clipper',
    category: 'Safety',
    purpose: 'Shave occasional peaks',
    placement: 'Just before the limiter',
    startingPoint: 'Use sparingly, listen for distortion',
  },
];

const CATEGORIES = ['All', 'Tone', 'Dynamics', 'Space', 'Safety'];

function slug(name: string): string {
  return name.replace(/\W/g, '');
}

export function FlStudioPage() {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState('');

  const visible = PLUGINS.filter((plugin) => category === 'All' || plugin.category === category);

  const focusPlugin = (name: string) => {
    setSelected(name);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`plugin-${slug(name)}`)?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'center',
    });
  };

  return (
    <section className="page">
      <h1 className="page__title">FL STUDIO</h1>
      <p className="page__jp" lang="ja">
        プラグイン
      </p>
      <p className="page__lede page__lede--light">
        Stock plugin ideas with purpose and placement. Treat every setting as a starting point, and
        make every change by ear.
      </p>

      <div className="chips" role="group" aria-label="Filter plugin ideas">
        {CATEGORIES.map((item) => (
          <Button
            key={item}
            type="button"
            variant="secondary"
            className={category === item ? 'is-selected' : undefined}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      <div className="chain" role="group" aria-label="Suggested chain">
        {visible.map((plugin, index) => (
          <span key={plugin.name} className="chain__item">
            <button
              type="button"
              className={`chain__node${selected === plugin.name ? ' is-active' : ''}`}
              onClick={() => focusPlugin(plugin.name)}
            >
              {plugin.name}
            </button>
            {index < visible.length - 1 ? (
              <span className="chain__separator" aria-hidden="true">
                {' '}
                &gt;{' '}
              </span>
            ) : null}
          </span>
        ))}
      </div>

      <div className="plugin-grid">
        {visible.map((plugin) => (
          <Window key={plugin.name} title={plugin.name} className="plugin-card">
            <span id={`plugin-${slug(plugin.name)}`} className="plugin-anchor" aria-hidden="true" />
            <Tag variant="cyan">{plugin.category}</Tag>
            <dl className="plugin-meta">
              <dt className="plugin-meta__label">PURPOSE</dt>
              <dd>{plugin.purpose}</dd>
              <dt className="plugin-meta__label">PLACEMENT</dt>
              <dd>{plugin.placement}</dd>
              <dt className="plugin-meta__label">START WITH</dt>
              <dd>{plugin.startingPoint}</dd>
            </dl>
          </Window>
        ))}
      </div>

      <div className="note page-note">
        SceneTone does not control FL Studio or create .flp files. Verify every suggestion by
        listening.
      </div>
    </section>
  );
}
