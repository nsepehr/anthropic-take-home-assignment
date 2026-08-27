import type { ReactNode } from 'react';

export type TagVariant = 'accent' | 'accent-2' | 'neutral' | 'outline';

export interface TagProps {
  variant?: TagVariant;
  className?: string;
  title?: string;
  children: ReactNode;
}

/** Small pill label tinted from the Organic ramps (`.tag .tag-<variant>`). */
export function Tag({ variant = 'neutral', className, title, children }: TagProps) {
  return (
    <span className={['tag', `tag-${variant}`, className].filter(Boolean).join(' ')} title={title}>
      {children}
    </span>
  );
}
