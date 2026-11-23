'use client';

import { Button } from '@/components/ui/Button';
import { downloadJson, downloadMarkdown, exportBaseName, reportToMarkdown } from '@/lib/export';
import type { AudioMetrics, MixReport } from '@/types';

export function MixReportView({
  report,
  metrics,
  objective,
  model,
}: {
  report: MixReport;
  metrics: AudioMetrics;
  objective: string;
  model: string | null;
}) {
  return (
    <>
      <h2 className="report-heading">MEASURED FACTS</h2>
      <ul>
        {report.measuredFacts.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2 className="report-heading">HYPOTHESES</h2>
      <ul>
        {report.hypotheses.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2 className="report-heading">RECOMMENDATIONS</h2>
      <ul>
        {report.recommendations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2 className="report-heading">LIMITATIONS</h2>
      <ul>
        {report.limitations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="cta-row">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            downloadJson(`${exportBaseName(objective)}-mix-report.json`, {
              objective,
              metrics,
              model,
              report,
            })
          }
        >
          Save JSON
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            downloadMarkdown(
              `${exportBaseName(objective)}-mix-report.md`,
              reportToMarkdown(report, { objective, metrics, model }),
            )
          }
        >
          Save Markdown
        </Button>
      </div>
    </>
  );
}
