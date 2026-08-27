import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { EntityList } from './EntityList';

const items = (n: number) =>
  Array.from({ length: n }, (_, i) => <div key={i} className="item">{`item-${i}`}</div>);
const countItems = (html: string) => (html.match(/class="item"/g) ?? []).length;

describe('EntityList', () => {
  it('renders every item and no button when at or under the threshold', () => {
    const html = renderToString(
      <EntityList heading="Reqs" count={5}>
        {items(5)}
      </EntityList>,
    );
    expect(countItems(html)).toBe(5);
    expect(html).not.toContain('Show');
  });

  it('renders only 5 + "Show 3 more" when 8 items', () => {
    const html = renderToString(
      <EntityList heading="Reqs" count={8}>
        {items(8)}
      </EntityList>,
    );
    expect(countItems(html)).toBe(5);
    expect(html).toContain('>Show 3 more<');
    expect(html).toContain('aria-expanded="false"');
  });

  it('expanded → all 8 + "Show less"', () => {
    const html = renderToString(
      <EntityList heading="Reqs" count={8} defaultExpanded>
        {items(8)}
      </EntityList>,
    );
    expect(countItems(html)).toBe(8);
    expect(html).toContain('>Show less<');
    expect(html).toContain('aria-expanded="true"');
  });

  it('honours collapseAfter', () => {
    const html = renderToString(
      <EntityList heading="Reqs" count={4} collapseAfter={2}>
        {items(4)}
      </EntityList>,
    );
    expect(countItems(html)).toBe(2);
    expect(html).toContain('>Show 2 more<');
  });

  it('shows the empty message for zero items', () => {
    const html = renderToString(
      <EntityList heading="Reqs" count={0}>
        {[]}
      </EntityList>,
    );
    expect(html).toContain('Nothing recorded yet.');
  });
});
