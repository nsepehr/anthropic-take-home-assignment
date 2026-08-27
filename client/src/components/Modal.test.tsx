import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Modal } from './Modal';

const noop = () => {};

describe('Modal', () => {
  it('renders a labelled dialog over a backdrop', () => {
    const html = renderToString(
      <Modal title="What happens when you apply" onClose={noop}>
        <p>body</p>
      </Modal>,
    );
    expect(html).toContain('dialog-backdrop');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="What happens when you apply"');
    expect(html).toContain('body');
  });

  it('renders the footer only when one is given', () => {
    const withFoot = renderToString(
      <Modal title="t" onClose={noop} footer={<button type="button">Close</button>}>
        x
      </Modal>,
    );
    expect(withFoot).toContain('dialog-foot');
    expect(
      renderToString(
        <Modal title="t" onClose={noop}>
          x
        </Modal>,
      ),
    ).not.toContain('dialog-foot');
  });
});
