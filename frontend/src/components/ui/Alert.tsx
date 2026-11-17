import type { ReactNode } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
}

export function Alert({ variant = 'info', title, children }: AlertProps) {
  const role = variant === 'danger' ? 'alert' : 'status';

  return (
    <div className={`alert alert--${variant}`} role={role}>
      {title ? <p className="alert__title">{title}</p> : null}
      <div className="alert__body">{children}</div>
    </div>
  );
}
