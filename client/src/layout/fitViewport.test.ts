import { describe, expect, it } from 'vitest';
import { laneOrder } from '../model/lanes';
import { seedProject } from '../test/seed';
import { columnLayout } from './columns';
import { boundsOf, FIT, fitViewport } from './fitViewport';

const box = { x: 0, y: 0, width: 1000, height: 500 };

describe('boundsOf', () => {
  it('encloses every card', () => {
    expect(
      boundsOf([
        { position: { x: 10, y: 40 }, width: 100, height: 50 },
        { position: { x: 200, y: 0 }, width: 60, height: 20 },
      ]),
    ).toEqual({ x: 10, y: 0, width: 250, height: 90 });
  });

  it('is undefined when nothing is placed', () => {
    expect(boundsOf([])).toBeUndefined();
  });
});

describe('fitViewport', () => {
  it('centres the box and leaves the padding around it', () => {
    const { x, y, zoom } = fitViewport(box, 900, 800);
    // Width is the tighter of the two, so it sets the scale.
    expect(zoom).toBeCloseTo(900 / (1000 * (1 + FIT.padding)));
    // The box's centre lands on the canvas's centre.
    expect(x + 500 * zoom).toBeCloseTo(450);
    expect(y + 250 * zoom).toBeCloseTo(400);
  });

  it('never magnifies past the design size, and never shrinks past the floor', () => {
    expect(fitViewport(box, 4000, 4000).zoom).toBe(FIT.maxZoom);
    expect(fitViewport(box, 40, 40).zoom).toBe(FIT.minZoom);
  });
});

describe('the seed atlas at 1440×900', () => {
  /** What the shell leaves the diagram at a 1440×900 viewport, measured in the browser. */
  const CANVAS = { width: 1000, height: 767 };

  it('fits whole, at a scale that keeps the cards legible', () => {
    const layout = columnLayout(seedProject, { order: laneOrder(seedProject) });
    const bounds = boundsOf(layout.nodes)!;
    const { zoom } = fitViewport(bounds, CANVAS.width, CANVAS.height);
    expect(zoom).toBeGreaterThanOrEqual(0.6);
    expect(bounds.width * zoom).toBeLessThanOrEqual(CANVAS.width);
    expect(bounds.height * zoom).toBeLessThanOrEqual(CANVAS.height);
  });
});
