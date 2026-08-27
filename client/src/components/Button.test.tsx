import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Button } from './Button';

describe('Button', () => {
  it.each(['primary', 'secondary', 'ghost'] as const)('variant %s renders .btn-%s', (variant) => {
    expect(renderToString(<Button variant={variant}>x</Button>)).toContain(`btn btn-${variant}`);
  });

  it('adds icon and block modifiers and defaults type="button"', () => {
    const html = renderToString(<Button icon block />);
    expect(html).toContain('btn-icon');
    expect(html).toContain('btn-block');
    expect(html).toContain('type="button"');
  });
});
