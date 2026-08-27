import type { Requirement } from '@app/shared';
import { Dot } from './Dot';

export interface StatusDotProps {
  status: Requirement['status'];
  className?: string;
}

/** Filled 9px dot in the requirement status color (`--status-<status>`). */
export function StatusDot({ status, className }: StatusDotProps) {
  return <Dot token={`--status-${status}`} title={status} className={className} />;
}
