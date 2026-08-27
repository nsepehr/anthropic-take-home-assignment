import type { CSSProperties } from 'react';

interface DotProps {
  /** CSS custom property name, e.g. `--kind-ui`. */
  token: string;
  /** Outlined ring instead of a solid fill. */
  outlined?: boolean;
  title?: string;
  className?: string;
}

/** Small circle colored by a design token (`.dot`, `.dot-outlined`). Base for Kind/Status/Provenance dots. */
export function Dot({ token, outlined = false, title, className }: DotProps) {
  const classes = ['dot', outlined && 'dot-outlined', className].filter(Boolean).join(' ');
  const style = { '--dot-color': `var(${token})` } as CSSProperties;
  return <span className={classes} style={style} title={title} aria-label={title} role="img" />;
}
