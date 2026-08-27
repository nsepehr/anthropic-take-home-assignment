import type { Provenance } from '@app/shared';
import { Dot } from './Dot';

export interface ProvenanceDotProps {
  source: Provenance['source'];
  className?: string;
}

const LABEL: Record<Provenance['source'], string> = {
  'human-verified': 'Human-verified',
  'ai-inferred': 'AI-inferred',
};

/** 9px dot: filled sage for human-verified, outlined terracotta for ai-inferred. */
export function ProvenanceDot({ source, className }: ProvenanceDotProps) {
  const human = source === 'human-verified';
  return (
    <Dot
      token={human ? '--prov-human' : '--prov-ai'}
      outlined={!human}
      title={LABEL[source]}
      className={className}
    />
  );
}
