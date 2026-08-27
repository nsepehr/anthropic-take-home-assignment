import { useEffect, type ReactNode } from 'react';

export interface ModalProps {
  title: string;
  /** Esc, a backdrop click and anything in `footer` call this. */
  onClose: () => void;
  children: ReactNode;
  /** Right-aligned row under the body — usually one or two buttons. */
  footer?: ReactNode;
}

/** Organic dialog (`.dialog-backdrop` / `.dialog`): a titled overlay closed by Esc or the backdrop. */
export function Modal({ title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation(); // Esc belongs to the dialog while it is up, not to the canvas behind it
      onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="dialog-backdrop"
      // mousedown on the backdrop itself, so a drag that ends outside the dialog doesn't close it
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title}>
        <h3 className="dialog-title">{title}</h3>
        <div className="dialog-body sb">{children}</div>
        {footer && <div className="dialog-foot">{footer}</div>}
      </div>
    </div>
  );
}
