import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { SystemKind } from '@app/shared';
import { KindDot } from './KindDot';

describe('KindDot', () => {
  it.each(SystemKind.options)('kind %s fills with var(--kind-%s)', (kind) => {
    const html = renderToString(<KindDot kind={kind} />);
    expect(html).toContain(`--dot-color:var(--kind-${kind})`);
    expect(html).toContain(`title="${kind}"`);
  });
});
