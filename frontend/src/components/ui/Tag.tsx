import type { ReactNode } from 'react';

type TagVariant = 'pink' | 'cyan' | 'green' | 'yellow';

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
}

export function Tag({ children, variant = 'pink' }: TagProps) {
  return <span className={`tag tag--${variant}`}>{children}</span>;
}
