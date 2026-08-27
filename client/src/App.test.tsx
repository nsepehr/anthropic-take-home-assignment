import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from './App';

describe('App', () => {
  it('mounts the providers and the debug page', () => {
    expect(renderToString(<App />)).toContain('Codebase Map');
  });
});
