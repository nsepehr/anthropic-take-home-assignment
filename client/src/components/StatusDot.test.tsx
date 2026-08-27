import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { RequirementStatus } from '@app/shared';
import { StatusDot } from './StatusDot';

describe('StatusDot', () => {
  it.each(RequirementStatus.options)('status %s fills with var(--status-%s)', (status) => {
    expect(renderToString(<StatusDot status={status} />)).toContain(
      `--dot-color:var(--status-${status})`,
    );
  });
});
