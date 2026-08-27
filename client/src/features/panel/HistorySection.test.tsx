import { describe, expect, it } from 'vitest';
import { HistorySection } from './HistorySection';
import { renderPanel } from './test-utils';

describe('HistorySection', () => {
  it('offers the count and shows nothing until it is opened', () => {
    const html = renderPanel(<HistorySection systemId="sys-client-shell" />);
    expect(html).toContain('Show history (2)');
    expect(html).not.toContain('panel-history-item');
  });

  it('lists a superseded entry with its class, date and replacement', () => {
    const html = renderPanel(<HistorySection systemId="sys-client-shell" defaultOpen />);
    expect(html).toContain('Hide history');
    expect(html).toContain('Superseded');
    expect(html).toContain('Intent');
    expect(html).toContain('Overview vs deep dive is one global switch, not per card');
    expect(html).toContain(
      'Replaced by: Deep dive is per selection, opened from the detail card, not a global mode',
    );
    expect(html).toContain('2026-08-27');
  });

  it('lists a withdrawn entry with the reason it was dropped', () => {
    const html = renderPanel(<HistorySection systemId="sys-client-panel" defaultOpen />);
    expect(html).toContain('Withdrawn');
    expect(html).toContain('Non-current entries stay in the main lists');
    expect(html).toContain('the current view must contain only what is true now');
  });

  it('is absent entirely for a system with no history', () => {
    expect(renderPanel(<HistorySection systemId="sys-server-api" />)).toBe('');
  });
});
