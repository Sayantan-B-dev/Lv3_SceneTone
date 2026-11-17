import { describe, expect, it } from 'vitest';
import { answerLocally, type PageSnapshot } from './page-context';

const snapshot: PageSnapshot = {
  path: '/analyze',
  title: 'SceneTone',
  headings: ['ANALYZE'],
  windows: ['open_file.exe', 'metrics.exe'],
  buttons: ['Load file', 'Build report', 'Save JSON'],
  fields: ['Goal'],
  alerts: [],
  metrics: ['Length 12.00 s'],
  text: 'Path: /analyze',
};

describe('answerLocally', () => {
  it('describes the visible page for a broad question', () => {
    const answer = answerLocally('What is on this page?', snapshot);

    expect(answer).toContain('ANALYZE');
    expect(answer.toLowerCase()).toMatch(/maybe|think|possibly/);
  });

  it('lists controls for a button question', () => {
    const answer = answerLocally('Which button should I press?', snapshot);

    expect(answer).toContain('Build report');
    expect(answer).toContain('Load file');
  });

  it('reports a visible notice for an error question', () => {
    const answer = answerLocally('What is wrong?', {
      ...snapshot,
      alerts: ['Report not generated: Request validation failed.'],
    });

    expect(answer).toContain('Report not generated');
  });

  it('stays honest when no error is visible', () => {
    const answer = answerLocally('What went wrong?', snapshot);

    expect(answer).toContain('do not see an error notice');
  });
});
