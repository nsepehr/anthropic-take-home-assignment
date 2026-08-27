import type { System } from '@app/shared';
import { Dot } from './Dot';

export interface KindDotProps {
  kind: System['kind'];
  className?: string;
}

/** Filled 9px dot in the system kind's color (`--kind-<kind>`). */
export function KindDot({ kind, className }: KindDotProps) {
  return <Dot token={`--kind-${kind}`} title={kind} className={className} />;
}
