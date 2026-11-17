import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Window } from './Window';

describe('Window', () => {
  it('labels the window region with its title', () => {
    render(
      <Window title="brief.exe">
        <p>Body content</p>
      </Window>,
    );

    expect(screen.getByRole('heading', { name: 'brief.exe' })).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});
