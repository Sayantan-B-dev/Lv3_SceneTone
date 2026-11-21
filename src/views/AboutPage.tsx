'use client';

import { FaqList } from '@/components/ui/FaqList';
import { Window } from '@/components/ui/Window';

const FAQ = [
  {
    question: 'Is SceneTone a DAW?',
    answer:
      'No. It makes blueprints, measurements and reports. You do the sound design in your own DAW.',
  },
  {
    question: 'Does my audio get uploaded?',
    answer:
      'No. In the audio phase, WAV and MP3 files will be decoded and measured in your browser.',
  },
  {
    question: 'Is RMS the same as LUFS?',
    answer: 'No. LUFS uses K-weighting and gating. This tool reports plain RMS.',
  },
  {
    question: 'Can it generate music?',
    answer: 'Not in V1. SceneTone plans and reports; it does not render finished music.',
  },
  {
    question: 'Does it control FL Studio?',
    answer:
      'No. It suggests stock plugins and placement for you to set up by hand. It does not create .flp files.',
  },
];

const DEFINITIONS = [
  ['Sample peak', 'Largest sample in dBFS', 'True peak'],
  ['RMS', 'Average level over the clip', 'LUFS'],
  ['Crest', 'Peak minus RMS', 'Loudness range'],
  ['Bands', 'Approximate energy per range', 'Weighted'],
  ['Correlation', 'L and R similarity', 'Phase scope'],
];

export function AboutPage() {
  return (
    <section className="page">
      <h1 className="page__title">ABOUT</h1>
      <p className="page__jp" lang="ja">
        情報
      </p>

      <div className="grid grid--2">
        <Window title="faq.exe">
          <FaqList items={FAQ} />
        </Window>

        <Window title="definitions.exe">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col">Means</th>
                  <th scope="col">Not</th>
                </tr>
              </thead>
              <tbody>
                {DEFINITIONS.map(([metric, means, not]) => (
                  <tr key={metric}>
                    <td>{metric}</td>
                    <td>{means}</td>
                    <td>{not}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="note">
            This is a design preview. Blueprints and reports come from local templates until the AI
            provider phase is implemented.
          </div>
        </Window>
      </div>
    </section>
  );
}
