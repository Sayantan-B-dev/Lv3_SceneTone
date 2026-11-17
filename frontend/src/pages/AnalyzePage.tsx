import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { Window } from '@/components/ui/Window';

const BANDS = ['Sub', 'Low', 'Low-mid', 'Mid', 'High-mid', 'High', 'Air'];
const METRICS = ['Length', 'Sample peak', 'RMS', 'Crest', 'Stereo corr.', 'Channels'];

export function AnalyzePage() {
  return (
    <section className="page">
      <h1 className="page__title">ANALYZE</h1>
      <p className="page__jp" lang="ja">
        分析 ローカル
      </p>

      <div className="grid grid--12">
        <Window title="open_file.exe">
          <div className="drop">
            <span className="drop__icon" aria-hidden="true">
              ♪
            </span>
            <b className="drop__title">Drop WAV or MP3</b>
            Local decoding connects in the audio phase. Nothing is uploaded, ever.
          </div>
          <div className="cta-row">
            <Button type="button" variant="cyan" disabled>
              Use demo signal
            </Button>
            <Button type="button" variant="secondary" disabled>
              Play
            </Button>
            <span>No file loaded</span>
          </div>
          <Alert variant="warning" title="Not active in this build">
            This page is a design preview. No audio is decoded, measured or played here yet.
          </Alert>
        </Window>

        <Window title="spectrum.exe">
          <div className="spectrum">
            <span className="spectrum__empty">No signal loaded</span>
          </div>
          <div className="metric-grid">
            {METRICS.map((metric) => (
              <div className="metric" key={metric}>
                <span className="metric__label">{metric}</span>
                <span className="metric__value">—</span>
              </div>
            ))}
          </div>
        </Window>
      </div>

      <div className="grid grid--2 section-stack">
        <Window title="band_energy.exe">
          <div className="inset-panel">
            <div className="bands" role="group" aria-label="Band energy placeholder">
              {BANDS.map((band) => (
                <div className="band" key={band}>
                  <span className="band__bar" style={{ height: '4%' }} aria-hidden="true" />
                  <span className="band__label">{band}</span>
                </div>
              ))}
            </div>
          </div>
        </Window>

        <Window title="mix_report.exe">
          <Field label="Goal">
            {(fieldProps) => (
              <Select {...fieldProps} defaultValue="Streaming master">
                <option>Streaming master</option>
                <option>Film / video cue</option>
                <option>Game ambience loop</option>
                <option>Rough demo</option>
              </Select>
            )}
          </Field>
          <div className="cta-row">
            <Button type="button" variant="primary" disabled>
              Build report
            </Button>
          </div>
          <Alert variant="info" title="Metrics only">
            Reports will separate measured facts, hypotheses and recommendations. They will never
            claim that a model listened to your audio.
          </Alert>
        </Window>
      </div>

      <div className="note page-note">
        RMS is not LUFS. Sample peak is not true peak. Band energy is approximate. Trust your ears
        first.
      </div>
    </section>
  );
}
