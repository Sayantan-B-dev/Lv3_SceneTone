import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label as an accessible button', () => {
    render(<Button>Analyze</Button>);

    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
  });
});
