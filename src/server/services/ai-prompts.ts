import type { BlueprintRequest, MixReportRequest } from '../schemas/ai.schema';

const BLUEPRINT_SYSTEM = `You are a soundscape production planner for a music production co-pilot.
You return only a single JSON object that matches the requested structure, with no prose, no code
fences and no commentary. You never claim to have heard audio. You separate assumptions and
uncertainty from firm decisions. Plugin suggestions use only FL Studio stock plugins.`;

function optionalLine(label: string, value: string | number | undefined): string {
  return value === undefined || value === '' ? '' : `- ${label}: ${value}\n`;
}

export function buildBlueprintPrompt(input: BlueprintRequest): { system: string; user: string } {
  const user = `Create a soundscape blueprint.

- Scene: ${input.sceneDescription}
${optionalLine('Target duration (seconds)', input.durationSeconds)}
${optionalLine('Style direction', input.styleDirection)}
${optionalLine('Emotional arc', input.emotionalArc)}
${optionalLine('Platform', input.platform)}
${optionalLine('Constraints', input.constraints)}
Return JSON with exactly these keys:
{
  "title": string,
  "summary": string,
  "bpm": integer 1-300 or null,
  "key": string or null,
  "mood": { "primary": string, "secondary": string[], "energyCurve": [{ "position": 0-1, "energy": 0-1 }] },
  "arrangement": [{ "name": string, "bars": integer >= 0 or null, "energy": 0-1, "elements": string[], "notes": string or null }],
  "layers": [{ "name": string, "role": string, "description": string, "frequencyFocus": string or null }],
  "foleyAndAmbience": string[],
  "automation": string[],
  "transitions": string[],
  "productionNotes": string[],
  "flStudioChain": [{ "plugin": string, "purpose": string, "placement": string, "startingPoint": string }],
  "assumptions": string[],
  "uncertainty": string[]
}
Rules: 3-8 arrangement sections ordered in time; energyCurve ascending in position; 3-6 layers;
2-5 FL Studio stock plugins named exactly (Fruity Parametric EQ 2, Fruity Compressor, Fruity Limiter,
Fruity Reeverb 2, Fruity Delay 3, Maximus, Fruity Soft Clipper). Starting points are suggestions.
List every interpretive guess in "assumptions". Do not invent measured audio values.`;

  return { system: BLUEPRINT_SYSTEM, user };
}

const MIX_REPORT_SYSTEM = `You are an audio-production co-pilot that interprets objective numeric
measurements. You did not listen to the audio and must never claim to have heard it. You return only
a single JSON object with no prose and no code fences.`;

export function buildMixReportPrompt(input: MixReportRequest): { system: string; user: string } {
  const metrics = JSON.stringify(input.metrics, null, 2);
  const context = input.projectContext
    ? `Project context:
${input.projectContext.name ? `- Name: ${input.projectContext.name}\n` : ''}${
        input.projectContext.sceneBrief ? `- Scene brief: ${input.projectContext.sceneBrief}\n` : ''
      }${
        input.projectContext.blueprintSummary
          ? `- Blueprint summary: ${input.projectContext.blueprintSummary}\n`
          : ''
      }`
    : 'No project context was provided.';

  const user = `Goal: ${input.objective}

Measured metrics (JSON):
${metrics}

${context}
Interpretation rules:
- "measuredFacts" may only restate the numbers above, with their limits (for example duration,
  channel count, sample peak dBFS, RMS dBFS, crest factor, approximate band energy, stereo
  correlation). At least one fact is required.
- "hypotheses" are plausible interpretations that the numbers do not prove.
- "recommendations" are concrete FL Studio stock-plugin actions with a purpose and starting point.
- "limitations" must state that RMS is not LUFS, sample peak is not true peak, band energy is
  approximate and no listening was performed. Mention mono correlation limits when channels is 1.

Return JSON:
{
  "measuredFacts": string[],
  "hypotheses": string[],
  "recommendations": string[],
  "limitations": string[]
}`;

  return { system: MIX_REPORT_SYSTEM, user };
}

const GUIDE_SYSTEM = `You are the SceneTone desktop guide, a small helper that lives on the page.
You receive a text snapshot of the visible page and chat history, never the real browser. You can
describe what is on the page, what a control probably does and how the workflow usually goes, but
you cannot click anything, cannot see audio and cannot hear audio. Be chatty and brief: one to four
short sentences. Hedge naturally when you are inferring ("probably", "maybe", "I think", "possibly",
"if I'm reading this right"). Say plainly when the snapshot does not contain the answer instead of
inventing features. Never claim the AI listened to audio or produced a real measurement. Plain text
only, no markdown, no headings.`;

export function buildGuidePrompt(input: {
  question: string;
  pageContext?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}): { system: string; user: string } {
  const snapshot = input.pageContext?.trim() || 'No page snapshot was provided.';
  const history =
    input.history && input.history.length > 0
      ? input.history.map((entry) => `${entry.role}: ${entry.content}`).join('\n')
      : '(this is the first question)';

  const user = `Visible page snapshot:
${snapshot}

Recent chat:
${history}

Visitor's question: ${input.question}

Answer as the page guide, in plain text, using only the snapshot plus general knowledge of the app.`;

  return { system: GUIDE_SYSTEM, user };
}
