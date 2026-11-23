'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { MixReportView } from '@/components/report/MixReportView';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { Window } from '@/components/ui/Window';
import { useGenerateMixReport } from '@/hooks/useAi';
import { analyzeAudioFile, type AudioAnalysis } from '@/lib/audio-analysis';
import { describeError } from '@/lib/errors';
import type { MixReport } from '@/types';

const BANDS = [
  { key: 'low', label: 'Low < 250 Hz' },
  { key: 'mid', label: 'Mid 250 Hz-4 kHz' },
  { key: 'high', label: 'High > 4 kHz' },
] as const;

const OBJECTIVES = [
  'Streaming master',
  'Film / video cue',
  'Game ambience loop',
  'Rough demo',
] as const;

function metricRows(analysis: AudioAnalysis) {
  return [
    ['Length', `${analysis.durationSeconds.toFixed(2)} s`],
    ['Channels', analysis.channels === 1 ? 'Mono' : 'Stereo'],
    ['Sample peak', analysis.samplePeakDbfs === null ? 'Silent' : `${analysis.samplePeakDbfs} dBFS`],
    ['RMS', analysis.rmsDbfs === null ? 'Silent' : `${analysis.rmsDbfs} dBFS`],
    ['Crest', analysis.crestFactorDb === null ? '—' : `${analysis.crestFactorDb} dB`],
    [
      'Stereo corr.',
      analysis.stereoCorrelation === null ? 'n/a (mono)' : analysis.stereoCorrelation.toFixed(3),
    ],
  ] as const;
}

export function AnalyzePage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') ?? undefined;
  const fileInput = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const report = useGenerateMixReport();
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [objective, setObjective] = useState<string>(OBJECTIVES[0]);
  const [mixReport, setMixReport] = useState<MixReport | null>(null);
  const [reportModel, setReportModel] = useState<string | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setDecodeError(null);
    setMixReport(null);
    setReportModel(null);
    setDecoding(true);
    setProgress(0);

    try {
      setAnalysis(
        await analyzeAudioFile(file, {
          signal: controller.signal,
          onProgress: setProgress,
        }),
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      setAnalysis(null);
      setDecodeError(error instanceof Error ? error.message : 'The file could not be analyzed.');
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setDecoding(false);
      }
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setDecoding(false);
    setProgress(0);
  }

  function handleReport() {
    if (!analysis) {
      return;
    }

    report.mutate(
      {
        objective,
        metrics: {
          channels: analysis.channels,
          durationSeconds: analysis.durationSeconds,
          samplePeakDbfs: analysis.samplePeakDbfs,
          rmsDbfs: analysis.rmsDbfs,
          crestFactorDb: analysis.crestFactorDb,
          bandEnergy: analysis.bandEnergy,
          stereoCorrelation: analysis.stereoCorrelation,
        },
        ...(projectId ? { projectId } : {}),
      },
      {
        onSuccess: (data) => {
          setMixReport(data.report);
          setReportModel(data.model);
        },
      },
    );
  }

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
            <label className="drop__title" htmlFor="audio-file">
              Choose a WAV or MP3
            </label>
            <input
              ref={fileInput}
              id="audio-file"
              type="file"
              accept="audio/wav,audio/mpeg,audio/*,.wav,.mp3"
              onChange={handleFile}
            />
            <p>Decoded in this tab. The audio file is never uploaded.</p>
          </div>

          <div className="cta-row">
            <Button type="button" variant="secondary" onClick={() => fileInput.current?.click()}>
              {analysis ? 'Load another file' : 'Load file'}
            </Button>
            {decoding ? (
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            ) : null}
            <span aria-live="polite">
              {decoding
                ? `Analyzing... ${Math.round(progress * 100)}%`
                : analysis
                  ? `${analysis.fileName} (${(analysis.sizeBytes / 1024 / 1024).toFixed(2)} MB)`
                  : 'No file loaded'}
            </span>
          </div>

          {decodeError ? (
            <Alert variant="danger" title="Audio could not be decoded">
              {decodeError}
            </Alert>
          ) : null}

          <Alert variant="info" title="What this measures">
            Duration, sample peak dBFS, RMS dBFS, crest factor, approximate band energy and stereo
            correlation. RMS is not LUFS and sample peak is not true peak.
          </Alert>
        </Window>

        <Window title="metrics.exe">
          <div className="metric-grid">
            {(analysis ? metricRows(analysis) : metricRows(emptyAnalysis())).map(
              ([label, value]) => (
                <div className="metric" key={label}>
                  <span className="metric__label">{label}</span>
                  <span className="metric__value">{analysis ? value : '—'}</span>
                </div>
              ),
            )}
          </div>

          <div className="inset-panel">
            <div className="bands" role="group" aria-label="Approximate band energy">
              {BANDS.map((band) => (
                <div className="band" key={band.key}>
                  <span
                    className="band__bar"
                    style={{
                      height: analysis
                        ? `${Math.max(4, Math.round(analysis.bandEnergy[band.key] * 100))}%`
                        : '4%',
                    }}
                    aria-hidden="true"
                  />
                  <span className="band__label">{band.label}</span>
                </div>
              ))}
            </div>
          </div>

          {analysis?.samplePeakDbfs === null ? (
            <Alert variant="warning" title="Silent signal">
              Every sample is zero. Metrics that need signal are reported as unavailable.
            </Alert>
          ) : null}
        </Window>
      </div>

      <div className="grid grid--2 section-stack">
        <Window title="mix_report.exe">
          <Field label="Goal">
            {(fieldProps) => (
              <Select
                {...fieldProps}
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
              >
                {OBJECTIVES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            )}
          </Field>
          <div className="cta-row">
            <Button
              type="button"
              variant="primary"
              disabled={!analysis || report.isPending}
              onClick={handleReport}
            >
              {report.isPending ? 'Building...' : 'Build report'}
            </Button>
          </div>
          {report.isError ? (
            <Alert variant="danger" title="Report not generated">
              {describeError(report.error)}
            </Alert>
          ) : null}
          <Alert variant="info" title="Metrics only">
            Only the numbers above are sent. The model never receives your audio and never listened
            to it.
          </Alert>
        </Window>

        <Window title="report_view.exe">
          {!mixReport || !analysis ? (
            <p className="text-muted">
              Load a file and build a report. Measured facts, hypotheses, recommendations and
              limitations are listed separately.
            </p>
          ) : (
            <MixReportView
              report={mixReport}
              metrics={analysis}
              objective={objective}
              model={reportModel}
            />
          )}
        </Window>
      </div>

      <div className="note page-note">
        RMS is not LUFS. Sample peak is not true peak. Band energy is approximate. Trust your ears
        first.
      </div>
    </section>
  );
}

function emptyAnalysis(): AudioAnalysis {
  return {
    fileName: '',
    sizeBytes: 0,
    channels: 1,
    durationSeconds: 0,
    samplePeakDbfs: null,
    rmsDbfs: null,
    crestFactorDb: null,
    bandEnergy: { low: 0, mid: 0, high: 0 },
    stereoCorrelation: null,
  };
}
