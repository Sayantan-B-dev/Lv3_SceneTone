import { useEffect, useState } from 'react';

function formatTime(date: Date): string {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <time className="clock" dateTime={now.toISOString()} aria-label="Local time">
      {formatTime(now)}
    </time>
  );
}
