export interface PageSnapshot {
  path: string;
  title: string;
  headings: string[];
  windows: string[];
  buttons: string[];
  fields: string[];
  alerts: string[];
  metrics: string[];
  text: string;
}

const MAX_TEXT = 5000;

function normalize(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function isVisible(element: Element): boolean {
  if (element.closest('[data-guide-root]')) {
    return false;
  }

  const rects = element.getClientRects();
  return rects.length > 0;
}

function collectTexts(selector: string, limit: number, root: ParentNode): string[] {
  const values: string[] = [];

  for (const element of root.querySelectorAll(selector)) {
    if (!isVisible(element)) {
      continue;
    }

    const text = normalize(element.textContent);
    if (text.length === 0 || values.includes(text)) {
      continue;
    }

    values.push(text.slice(0, 160));
    if (values.length >= limit) {
      break;
    }
  }

  return values;
}

/** Reads the visible page into a compact text snapshot. No network, no storage. */
export function capturePageSnapshot(): PageSnapshot {
  const root = document.querySelector('main') ?? document.body;
  const headings = collectTexts('h1, h2:not(.window__title), h3', 12, root);
  const windows = collectTexts('.window__title', 12, root);
  const buttons = collectTexts('button, a.button, [role="button"]', 16, root);
  const fields = collectTexts('.field__label', 14, root);
  const metrics = collectTexts('.metric', 12, root);

  const alerts = Array.from(root.querySelectorAll('.alert, .field__error'))
    .filter((element) => isVisible(element))
    .map((element) => normalize(element.textContent))
    .filter((text) => text.length > 0 && text.length < 400)
    .slice(0, 6);

  const navLinks = collectTexts('.app-nav__link', 10, document.body);
  const pages = collectTexts('.project-card__title, .project-title', 6, root);

  const parts = [
    `Path: ${window.location.pathname}${window.location.search}`,
    `Page title: ${document.title}`,
    headings.length ? `Headings: ${headings.join(' | ')}` : '',
    windows.length ? `Panels: ${windows.join(' | ')}` : '',
    pages.length ? `Projects listed: ${pages.join(' | ')}` : '',
    buttons.length ? `Buttons and links: ${buttons.join(' | ')}` : '',
    fields.length ? `Form fields: ${fields.join(' | ')}` : '',
    metrics.length ? `Metrics: ${metrics.join(' | ')}` : '',
    alerts.length ? `Visible notices and errors: ${alerts.join(' | ')}` : 'No error notices visible.',
    navLinks.length ? `Main navigation: ${navLinks.join(' | ')}` : '',
  ].filter(Boolean);

  return {
    path: window.location.pathname,
    title: document.title,
    headings,
    windows,
    buttons,
    fields,
    alerts,
    metrics,
    text: parts.join('\n').slice(0, MAX_TEXT),
  };
}

const GENERIC = [
  'Possibly I can only read the text that is visible right now, so I may be missing things.',
  'Maybe reload the page if this looks out of date.',
];

function list(items: string[], label: string): string {
  if (items.length === 0) {
    return `I think there are no ${label} on this screen yet.`;
  }

  return `${label}: ${items.slice(0, 6).join('; ')}.`;
}

/**
 * Local fallback answer built from the same snapshot. Used when the AI provider
 * is unavailable, so the guide keeps working without pretending to be a model.
 */
export function answerLocally(question: string, snapshot: PageSnapshot): string {
  const query = question.toLowerCase();

  if (/(error|wrong|fail|broken|not work|problem|invalid)/.test(query)) {
    if (snapshot.alerts.length > 0) {
      return `I think I can see a notice: ${snapshot.alerts.join(' / ')}. ${GENERIC[0]}`;
    }

    return 'I do not see an error notice on this screen, so maybe the problem is in a panel that is closed or lower on the page.';
  }

  if (/(button|click|press|do|action|next|start)/.test(query)) {
    const buttons = snapshot.buttons.length
      ? `I can see these controls: ${snapshot.buttons.join('; ')}.`
      : 'I do not see any buttons in the snapshot.';
    return `${buttons} Possibly the primary button on each panel submits or generates that panel's result.`;
  }

  if (/(analy|audio|metric|report|lufs|dbfs|peak|rms|file)/.test(query)) {
    return 'Probably this is the Analyze page: choose a WAV or MP3, the browser decodes it locally, then Build report sends only the numbers. I think RMS is not LUFS and sample peak is not true peak.';
  }

  if (/(blueprint|scene|bpm|key|arrangement|layer)/.test(query)) {
    return 'Maybe this is the Blueprint page: describe the scene, set a duration and direction, then generate a plan with BPM, sections, layers and an FL Studio chain. It is a plan, not rendered audio.';
  }

  if (/(project|save|dashboard|workspace|rename|delete)/.test(query)) {
    return 'Possibly this is the workspace: projects hold blueprints and mix reports. I think create, rename and delete are owner-scoped and only visible after sign-in.';
  }

  if (/(what|page|here|screen|content|tell me)/.test(query)) {
    const pieces = [
      snapshot.headings.length ? `Headings read ${snapshot.headings.join(', ')}` : '',
      snapshot.windows.length ? `panels are ${snapshot.windows.join(', ')}` : '',
      snapshot.fields.length ? `fields are ${snapshot.fields.join(', ')}` : '',
    ].filter(Boolean);

    return pieces.length
      ? `Maybe this page is about ${pieces.join('; ')}. ${list(snapshot.buttons, 'Controls')}`
      : 'I think this screen is mostly empty right now, so there is not much to describe.';
  }

  return `I think I only see this much: ${snapshot.headings.join(', ') || snapshot.title}. ${GENERIC[0]}`;
}
