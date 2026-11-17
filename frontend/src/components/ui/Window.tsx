import { useId, type ReactNode } from 'react';

interface WindowProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function Window({ title, children, className }: WindowProps) {
  const titleId = useId();
  const classes = `window${className ? ` ${className}` : ''}`;

  return (
    <div className={classes}>
      <div className="window__titlebar">
        <h2 className="window__title" id={titleId} title={title}>
          {title}
        </h2>
      </div>
      <div className="window__body">{children}</div>
    </div>
  );
}
