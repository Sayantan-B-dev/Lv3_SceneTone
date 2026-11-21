'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Marquee } from '@/components/ui/Marquee';
import { SceneVisualizer } from '@/components/ui/SceneVisualizer';
import { Window } from '@/components/ui/Window';

export function LandingPage() {
  const [message, setMessage] = useState('');

  return (
    <section className="page">
      <div className="hero">
        <div>
          <h1 className="hero__title">
            SCENE
            <br />
            TONE
          </h1>
          <p className="hero__jp" lang="ja">
            シーントーン 蒸気波
          </p>
          <p className="hero__lead">
            Describe a scene. Shape a production plan. Audio stays in your browser when the analyzer
            lands.
          </p>
          <div className="cta-row">
            <Link className="button button--primary" href="/blueprint">
              Start a blueprint
            </Link>
            <Link className="button button--cyan" href="/analyze">
              Analyze a file
            </Link>
          </div>
        </div>
        <Window title="scene_arc.exe">
          <SceneVisualizer />
        </Window>
      </div>

      <Marquee />

      <div className="grid grid--3 section-stack">
        <Window title="welcome.txt">
          <p>
            Blueprints list the BPM, key, energy curve, sections, layers and automation for a scene.
          </p>
          <div className="cta-row">
            <Link className="button button--secondary" href="/blueprint">
              Open
            </Link>
          </div>
        </Window>
        <Window title="local_only.txt">
          <p>
            The analyzer is not active in this build. When it lands, WAV and MP3 files will be
            decoded here. Nothing will be uploaded.
          </p>
          <div className="cta-row">
            <Link className="button button--secondary" href="/analyze">
              Open
            </Link>
          </div>
        </Window>
        <Window title="are_you_ready.exe">
          <p>Are you ready to enter the aesthetic?</p>
          <div className="cta-row">
            <Link className="button button--primary" href="/blueprint">
              Enter
            </Link>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setMessage('You cannot leave the aesthetic')}
            >
              Leave
            </Button>
          </div>
          {message ? (
            <p className="note" role="status">
              {message}
            </p>
          ) : null}
        </Window>
      </div>
    </section>
  );
}
