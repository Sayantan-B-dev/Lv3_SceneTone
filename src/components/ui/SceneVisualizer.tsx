'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { Field } from './Field';
import { Input } from './Input';
import { Tag } from './Tag';

const MOODS = [
  {
    name: 'Cinematic tension',
    bpm: 72,
    key: 'D minor',
    sky: '--scene-a',
    glow: '--scene-b',
    line: '--scene-c',
    tag: 'pink',
  },
  {
    name: 'Rain noir',
    bpm: 64,
    key: 'A minor',
    sky: '--scene-c',
    glow: '--scene-a',
    line: '--scene-d',
    tag: 'cyan',
  },
  {
    name: 'Lo-fi dusk',
    bpm: 84,
    key: 'F major',
    sky: '--scene-b',
    glow: '--scene-e',
    line: '--scene-c',
    tag: 'yellow',
  },
  {
    name: 'Dawn bloom',
    bpm: 58,
    key: 'G major',
    sky: '--scene-e',
    glow: '--scene-b',
    line: '--scene-d',
    tag: 'green',
  },
] as const;

function readToken(styles: CSSStyleDeclaration, name: string): string {
  return styles.getPropertyValue(name).trim();
}

export function SceneVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [energy, setEnergy] = useState(60);
  const [tension, setTension] = useState(45);
  const [moodIndex, setMoodIndex] = useState(0);
  const [themeVersion, setThemeVersion] = useState(0);
  const mood = MOODS[moodIndex];

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeVersion((version) => version + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    const styles = getComputedStyle(document.documentElement);
    const skyTop = readToken(styles, mood.sky);
    const skyBottom = readToken(styles, mood.glow);
    const lineColor = readToken(styles, mood.line);
    const cyan = readToken(styles, '--color-cyan');
    const green = readToken(styles, '--color-green');
    const accent = readToken(styles, '--color-accent');
    const yellow = readToken(styles, '--color-yellow');
    const ink = readToken(styles, '--scene-ink');
    const width = canvas.width;
    const height = canvas.height;
    const horizon = height * 0.58;
    const energyLevel = energy / 100;
    const tensionLevel = tension / 100;

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      const sky = context.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, skyTop);
      sky.addColorStop(1, skyBottom);
      context.fillStyle = sky;
      context.fillRect(0, 0, width, height);

      const radius = 56 + energyLevel * 34;
      const sunY = horizon - radius * 0.55;
      const sun = context.createLinearGradient(0, sunY - radius, 0, sunY + radius);
      sun.addColorStop(0, yellow);
      sun.addColorStop(1, accent);
      context.fillStyle = sun;
      context.beginPath();
      context.arc(width / 2, sunY, radius, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = sky;
      for (let stripe = 0; stripe < 7; stripe += 1) {
        context.fillRect(
          width / 2 - radius,
          sunY + radius * 0.05 + stripe * radius * 0.15,
          radius * 2,
          1 + stripe * 1.6,
        );
      }

      context.lineWidth = 2;
      for (let wave = 0; wave < 4; wave += 1) {
        context.strokeStyle = wave % 2 === 0 ? cyan : green;
        context.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const y =
            horizon -
            26 -
            wave * 14 +
            Math.sin(x / 38 + (time / 500) * (1 + wave * 0.3) + wave) * energyLevel * 22 +
            Math.sin(x / 9 + time / 110) * tensionLevel * 7;
          if (x === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.stroke();
      }

      context.fillStyle = ink;
      context.fillRect(0, horizon, width, height - horizon);
      context.strokeStyle = lineColor;
      context.lineWidth = 1.5;

      for (let index = -10; index <= 10; index += 1) {
        context.beginPath();
        context.moveTo(width / 2 + index * 14, horizon);
        context.lineTo(width / 2 + index * 95, height);
        context.stroke();
      }

      for (let index = 0; index < 8; index += 1) {
        const progress = ((index + time / 900) % 8) / 8;
        const y = horizon + progress ** 2 * (height - horizon);
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      draw(0);
      return;
    }

    let frame = 0;
    let previous = 0;
    const tick = (time: number) => {
      if (time - previous > 40) {
        draw(time);
        previous = time;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [energy, tension, mood, themeVersion]);

  return (
    <div className="scene-console">
      <canvas
        ref={canvasRef}
        className="scene-console__canvas"
        width={640}
        height={320}
        role="img"
        aria-label="Vaporwave scene preview with sun, waves and neon grid"
      />
      <Field label="Energy">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            type="range"
            min={0}
            max={100}
            value={energy}
            onChange={(event) => setEnergy(Number(event.target.value))}
          />
        )}
      </Field>
      <Field label="Tension">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            type="range"
            min={0}
            max={100}
            value={tension}
            onChange={(event) => setTension(Number(event.target.value))}
          />
        )}
      </Field>
      <div className="scene-console__row">
        <span className="scene-console__tags" aria-live="polite">
          <Tag variant="cyan">{mood.bpm} BPM</Tag>
          <Tag variant={mood.tag}>{mood.key}</Tag>
        </span>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setMoodIndex((current) => (current + 1) % MOODS.length)}
        >
          Next mood: {mood.name}
        </Button>
      </div>
    </div>
  );
}
