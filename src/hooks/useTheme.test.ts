import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to system and applies the resolved theme', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.preference).toBe('system');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('scenetone.theme')).toBe('system');
  });

  it('persists an explicit preference without reloading', () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setPreference('dark'));

    expect(result.current.preference).toBe('dark');
    expect(window.localStorage.getItem('scenetone.theme')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
