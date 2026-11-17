import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FaqList } from './FaqList';

const ITEMS = [
  { question: 'First question', answer: 'First answer' },
  { question: 'Second question', answer: 'Second answer' },
];

describe('FaqList', () => {
  it('exposes expanded state and switches the open answer', () => {
    render(<FaqList items={ITEMS} />);

    const first = screen.getByRole('button', { name: /First question/ });
    const second = screen.getByRole('button', { name: /Second question/ });

    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(second).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('First answer')).toBeVisible();

    fireEvent.click(second);

    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Second answer')).toBeVisible();
    expect(screen.getByText('First answer')).not.toBeVisible();
  });
});
