import { describe, expect, it } from 'vitest';
import { laneOrder } from '../model/lanes';
import { toFlowElements } from '../model/toFlow';
import { seedProject } from '../test/seed';
import { ARC_EDGE_TYPE } from './columnEdges';
import { toColumnElements } from './columnFlow';
import { columnLayout } from './columns';

const elements = toFlowElements(seedProject);
const layout = columnLayout(seedProject, { order: laneOrder(seedProject) });
const { nodes, edges } = toColumnElements(elements.nodes, elements.edges, layout);

describe('toColumnElements', () => {
  it('gives every placed node the layout’s position, and no size of its own', () => {
    expect(nodes).toHaveLength(layout.nodes.length);
    for (const node of nodes) {
      const card = layout.nodes.find((n) => n.id === node.id)!;
      expect(node.position).toEqual(card.position);
      // Sizes stay out of the nodes so React Flow measures the cards and places their handles.
      expect([node.width, node.height]).toEqual([undefined, undefined]);
    }
  });

  it('drops nodes the layout did not place, and the edges that would dangle', () => {
    const partial = { ...layout, nodes: layout.nodes.slice(0, 1) };
    const trimmed = toColumnElements(elements.nodes, elements.edges, {
      ...partial,
      columns: new Map([[partial.nodes[0]!.id, 0]]),
    });
    expect(trimmed.nodes).toHaveLength(1);
    expect(trimmed.edges).toEqual([]);
  });

  it('arcs the edges inside a column and gives the rest facing handles', () => {
    const arcs = edges.filter((e) => e.type === ARC_EDGE_TYPE);
    expect(arcs.length).toBeGreaterThan(0);
    for (const e of arcs) {
      expect(layout.columns.get(e.source)).toBe(layout.columns.get(e.target));
      expect([e.sourceHandle, e.targetHandle]).toEqual(['r', 'r']);
    }
    for (const e of edges.filter((e) => e.type !== ARC_EDGE_TYPE)) {
      expect(layout.columns.get(e.source)).not.toBe(layout.columns.get(e.target));
      expect(e.sourceHandle).toBeDefined();
    }
  });
});
