import type { TextareaHTMLAttributes } from 'react';

export function Textarea({
  className,
  rows = 5,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={`textarea${className ? ` ${className}` : ''}`} rows={rows} {...props} />
  );
}
