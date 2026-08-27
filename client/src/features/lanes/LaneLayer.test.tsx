import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ReactNode } from 'react';
import { LaneLayer } from './LaneLayer';

vi.mock('@xyflow/react', () => ({
  ViewportPortal: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('LaneLayer', () => {
  it('renders one labelled, positioned rectangle per lane', () => {
    const html = renderToString(
      <LaneLayer
        lanes={[
          { category: 'Model', x: 10, y: 20, width: 300, height: 400 },
          { category: 'Client', x: 350, y: 20, width: 200, height: 400 },
        ]}
      />,
    );
    expect(html.match(/data-testid="lane"/g)).toHaveLength(2);
    expect(html).toContain('translate(10px, 20px)');
    expect(html).toContain('>Model<');
    expect(html).toContain('>Client<');
    expect(html).toContain('text-transform:uppercase');
  });
});
