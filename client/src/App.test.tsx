import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from './App';

describe('App', () => {
  it('mounts the providers and the shell', () => {
    const html = renderToString(<App />);
    expect(html).toContain('class="shell"');
    expect(html).toContain('Loading project');
  });
});
