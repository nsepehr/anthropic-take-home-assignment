import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Tag } from './Tag';

describe('Tag', () => {
  it.each(['accent', 'accent-2', 'neutral', 'outline'] as const)(
    'variant %s renders .tag-%s',
    (variant) => {
      const html = renderToString(<Tag variant={variant}>x</Tag>);
      expect(html).toContain(`class="tag tag-${variant}"`);
    },
  );

  it('defaults to neutral', () => {
    expect(renderToString(<Tag>x</Tag>)).toContain('tag-neutral');
  });
});
