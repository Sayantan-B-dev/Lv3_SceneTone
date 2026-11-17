import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field } from './Field';
import { Input } from './Input';

describe('Field', () => {
  it('associates the label, hint and error with the control', () => {
    render(
      <Field label="Project name" hint="Keep it short." error="Name is required." required>
        {(props) => <Input {...props} />}
      </Field>,
    );

    const input = screen.getByLabelText(/Project name/);

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription('Keep it short. Name is required.');

    const describedBy = input.getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(describedBy).toHaveLength(2);
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required.');
  });
});
