'use client';

import { useTheme } from '@/hooks/useTheme';
import type { ThemePreference } from '@/types';

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <label className="theme-toggle">
      <span className="visually-hidden">Color theme</span>
      <select
        className="theme-toggle__select"
        value={preference}
        suppressHydrationWarning
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
