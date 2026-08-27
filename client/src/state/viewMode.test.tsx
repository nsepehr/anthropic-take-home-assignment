import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { parseViewMode, useViewMode, ViewModeProvider } from './viewMode';

describe('viewMode', () => {
  it('parses stored values defensively, defaulting to overview', () => {
    expect(parseViewMode('deepDive')).toBe('deepDive');
    expect(parseViewMode('overview')).toBe('overview');
    expect(parseViewMode(null)).toBe('overview');
    expect(parseViewMode('garbage')).toBe('overview');
  });

  it('defaults to overview when no storage is available', () => {
    function Probe() {
      return <p>{useViewMode().mode}</p>;
    }
    expect(
      renderToString(
        <ViewModeProvider>
          <Probe />
        </ViewModeProvider>,
      ),
    ).toContain('overview');
  });
});
