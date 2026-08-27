import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Square 36px icon-only button. */
  icon?: boolean;
  /** Full-width button. */
  block?: boolean;
}

/** Organic pill button (`.btn .btn-<variant>`); forwards native button attributes. */
export function Button({
  variant = 'secondary',
  icon = false,
  block = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = ['btn', `btn-${variant}`, icon && 'btn-icon', block && 'btn-block', className]
    .filter(Boolean)
    .join(' ');
  return <button type={type} className={classes} {...rest} />;
}
