import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { useGuideChat } from '@/hooks/useGuide';
import { describeError } from '@/lib/errors';
import { answerLocally, capturePageSnapshot, type PageSnapshot } from '@/lib/page-context';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const BOT_SIZE = 62;
const EDGE = 8;
const THROW_MS = 700;
const DRIFT_SPEED = 1.6;

const GREETING =
  "Possibly I'm the page guide. I think I can read what's on this screen, so ask me what something does, maybe which button to press, or what is going on.";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function randomSpot(): { x: number; y: number } {
  const maxX = Math.max(EDGE, window.innerWidth - BOT_SIZE - EDGE);
  const maxY = Math.max(EDGE, window.innerHeight - BOT_SIZE - EDGE);

  return {
    x: EDGE + Math.random() * (maxX - EDGE),
    y: EDGE + Math.random() * (maxY - EDGE),
  };
}

interface BotState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  target: { x: number; y: number };
  nextTargetAt: number;
  dragging: boolean;
  releasedAt: number;
  dragVelocityX: number;
  dragVelocityY: number;
  lastDragX: number;
  lastDragY: number;
  lastDragAt: number;
}

export function PageGuide() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: GREETING }]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const guide = useGuideChat();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const botRef = useRef<BotState>({
    x: Math.max(EDGE, window.innerWidth - 130),
    y: Math.max(EDGE, window.innerHeight - 170),
    vx: 0,
    vy: 0,
    target: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    nextTargetAt: 0,
    dragging: false,
    releasedAt: 0,
    dragVelocityX: 0,
    dragVelocityY: 0,
    lastDragX: 0,
    lastDragY: 0,
    lastDragAt: 0,
  });

  useEffect(() => {
    const state = botRef.current;
    let frame = 0;
    let previous = performance.now();

    function tick(now: number) {
      const dt = Math.min(48, now - previous);
      previous = now;
      const step = clamp(dt / 16.667, 0.2, 3);
      const maxX = Math.max(EDGE, window.innerWidth - BOT_SIZE - EDGE);
      const maxY = Math.max(EDGE, window.innerHeight - BOT_SIZE - EDGE);

      if (!state.dragging) {
        // Drift slowly toward a random spot, then pick another after a while.
        if (now > state.nextTargetAt) {
          state.target = randomSpot();
          state.nextTargetAt = now + 6000 + Math.random() * 5000;
        }

        const flying = now - state.releasedAt < THROW_MS;

        if (!flying) {
          state.vx += (state.target.x - state.x) * 0.0008 * step;
          state.vy += (state.target.y - state.y) * 0.0008 * step;
          state.vx *= Math.pow(0.98, step);
          state.vy *= Math.pow(0.98, step);
          state.vx = clamp(state.vx, -DRIFT_SPEED, DRIFT_SPEED);
          state.vy = clamp(state.vy, -DRIFT_SPEED, DRIFT_SPEED);
        } else {
          state.vx *= Math.pow(0.97, step);
          state.vy *= Math.pow(0.97, step);
        }

        state.x += state.vx * step;
        state.y += state.vy * step;

        // Bounce off the edges instead of leaving the screen.
        if (state.x < EDGE) {
          state.x = EDGE;
          state.vx = Math.abs(state.vx) * 0.45;
        } else if (state.x > maxX) {
          state.x = maxX;
          state.vx = -Math.abs(state.vx) * 0.45;
        }

        if (state.y < EDGE) {
          state.y = EDGE;
          state.vy = Math.abs(state.vy) * 0.45;
        } else if (state.y > maxY) {
          state.y = maxY;
          state.vy = -Math.abs(state.vy) * 0.45;
        }
      } else {
        state.x = clamp(state.x, EDGE, maxX);
        state.y = clamp(state.y, EDGE, maxY);
      }

      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      }

      frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) {
      return;
    }

    const state = botRef.current;
    state.dragging = true;
    state.dragVelocityX = 0;
    state.dragVelocityY = 0;
    state.lastDragX = event.clientX;
    state.lastDragY = event.clientY;
    state.lastDragAt = performance.now();
    state.vx = 0;
    state.vy = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add('is-dragging');
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const state = botRef.current;
    if (!state.dragging) {
      return;
    }

    const now = performance.now();
    const elapsed = Math.max(1, now - state.lastDragAt);
    const moveX = event.clientX - state.lastDragX;
    const moveY = event.clientY - state.lastDragY;

    state.lastDragX = event.clientX;
    state.lastDragY = event.clientY;
    state.lastDragAt = now;

    // Track velocity in pixels per 16.7 ms frame for the throw.
    state.dragVelocityX = (moveX / elapsed) * 16.667;
    state.dragVelocityY = (moveY / elapsed) * 16.667;

    state.x = clamp(event.clientX - BOT_SIZE / 2, EDGE, window.innerWidth - BOT_SIZE - EDGE);
    state.y = clamp(event.clientY - BOT_SIZE / 2, EDGE, window.innerHeight - BOT_SIZE - EDGE);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const state = botRef.current;
    if (!state.dragging) {
      return;
    }

    state.dragging = false;
    state.releasedAt = performance.now();
    state.vx = clamp(state.dragVelocityX, -16, 16);
    state.vy = clamp(state.dragVelocityY, -16, 16);
    // Settle where it lands instead of flying back to an old target.
    state.target = { x: state.x, y: state.y };
    state.nextTargetAt = state.releasedAt + 2500;
    event.currentTarget.classList.remove('is-dragging');

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function ask(question: string, snapshot: PageSnapshot) {
    const history = messages
      .slice(-6)
      .map((message) => ({ role: message.role, content: message.content.slice(0, 900) }));

    setThinking(true);

    try {
      const result = await guide.mutateAsync({
        question,
        pageContext: snapshot.text,
        history,
      });

      setMessages((current) => [...current, { role: 'assistant', content: result.answer }]);
    } catch (error) {
      const local = answerLocally(question, snapshot);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: `I could not reach the AI just now (${describeError(error)}). So maybe this helps: ${local}`,
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();

    if (!question || thinking) {
      return;
    }

    const snapshot = capturePageSnapshot();
    setMessages((current) => [...current, { role: 'user', content: question }]);
    setDraft('');
    void ask(question, snapshot);
  }

  return (
    <>
      <div className="page-guide" data-guide-root ref={wrapRef}>
        <button
          type="button"
          className="guide-bot"
          aria-label={open ? 'Close the page guide' : 'Open the page guide'}
          aria-expanded={open}
          aria-controls="page-guide-panel"
          onClick={(event) => {
            // Keyboard activation has detail 0; mouse users double click or throw the bot.
            if (event.detail === 0) {
              setOpen((value) => !value);
            }
          }}
          onDoubleClick={() => setOpen((value) => !value)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <span className="material-symbols-outlined guide-bot__icon" aria-hidden="true">
            smart_toy
          </span>
          {!open ? <span className="guide-bot__tag">double click</span> : null}
        </button>
      </div>

      {open ? (
        <aside
          className="guide-panel"
          id="page-guide-panel"
          data-guide-root
          role="dialog"
          aria-modal="false"
          aria-label="Page guide chat"
        >
          <div className="guide-panel__titlebar">
            <span className="guide-panel__title">page_guide.exe</span>
            <button
              type="button"
              className="guide-panel__close"
              onClick={() => setOpen(false)}
              aria-label="Close the page guide"
            >
              ×
            </button>
          </div>

          <div className="guide-panel__log">
            {messages.map((message, index) => (
              <p
                className={`guide-message guide-message--${message.role}`}
                key={`${message.role}-${index}`}
              >
                {message.content}
              </p>
            ))}
            {thinking ? (
              <p className="guide-message guide-message--pending">thinking, maybe...</p>
            ) : null}
          </div>

          <form className="guide-panel__form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="input guide-panel__input"
              value={draft}
              maxLength={500}
              placeholder="What is on this page?"
              aria-label="Ask the page guide"
              onChange={(event) => setDraft(event.target.value)}
            />
            <button
              type="submit"
              className="button button--primary guide-panel__send"
              disabled={draft.trim().length === 0 || thinking}
            >
              Send
            </button>
          </form>

          <p className="guide-panel__note">
            I read the visible page text only. Probably wrong sometimes, and I never hear the audio.
          </p>
        </aside>
      ) : null}
    </>
  );
}
