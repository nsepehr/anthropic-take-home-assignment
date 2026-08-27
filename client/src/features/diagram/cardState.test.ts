import { describe, expect, it } from 'vitest';
import { deriveSelection } from '../../model/selection';
import { seedProject } from '../../test/seed';
import { elementState } from './cardState';

describe('elementState', () => {
  it('is idle for everything while nothing is selected', () => {
    const selection = deriveSelection(seedProject, null);
    expect(elementState('sys-client-app', selection)).toBe('idle');
  });

  it('distinguishes selected, related and dimmed once something is selected', () => {
    const selection = deriveSelection(seedProject, 'edge-client-calls-server');
    expect(elementState('edge-client-calls-server', selection)).toBe('selected');
    expect(elementState('sys-client-app', selection)).toBe('related');
    expect(elementState('sys-shared-model', selection)).toBe('dimmed');
  });
});
