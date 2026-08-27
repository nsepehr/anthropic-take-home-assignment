import type { ReactNode } from 'react';

/** Generic ramps, plus the card-tag and header-legend pills of design revision 4. */
export type TagVariant =
  | 'accent'
  | 'accent-2'
  | 'neutral'
  | 'outline'
  | 'card-kind'
  | 'card-req'
  | 'card-why'
  | 'card-verified'
  | 'card-ai'
  | 'legend-verified'
  | 'legend-ai';

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
