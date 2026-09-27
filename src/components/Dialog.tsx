import { useEffect, useRef, type ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onDismiss: () => void;
}

export function Dialog({ open, title, children, onDismiss }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', onKey);
    const first = panel.current?.querySelector<HTMLElement>('button, [href], input, select, textarea');
    first?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onDismiss()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title} ref={panel}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
