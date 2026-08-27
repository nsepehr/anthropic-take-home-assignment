import type { ELK as ElkInstance, ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled.js';

/** The minimum React Flow needs to lay out: ids, nesting, and a size for leaves. */
export interface LayoutNode {
  id: string;
  parentId?: string;
  width?: number;
  height?: number;
  position: { x: number; y: number };
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
}

/** ELK layout options (`elk.*` keys), merged over the defaults. Pass a stable object. */
export type ElkOptions = Record<string, string>;

/** Maps a top-level node id to its partition index; partitions become left-to-right columns. */
export type PartitionOf = (nodeId: string) => number | undefined;

const DEFAULT_ELK_OPTIONS: ElkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  'elk.layered.spacing.nodeNodeBetweenLayers': '60',
  'elk.spacing.nodeNode': '30',
  'elk.padding': '[top=40,left=20,bottom=20,right=20]',
};

/** ELK is ~1.5 MB: loaded on first use (off the startup path) and reused across layouts. */
let elk: Promise<ElkInstance> | undefined;
function getElk(): Promise<ElkInstance> {
  elk ??= import('elkjs/lib/elk.bundled.js').then((m) => new m.default());
  return elk;
}

/**
 * Runs ELK over React Flow nodes/edges and returns the same nodes with positions (relative to
 * their parent, as React Flow expects) and ELK-computed sizes for compound nodes. Pure apart
 * from the ELK call: no DOM, no state.
 */
export async function layoutWithElk<N extends LayoutNode>(
  nodes: N[],
  edges: LayoutEdge[],
  options: ElkOptions = {},
  partitionOf?: PartitionOf,
): Promise<N[]> {
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      ...DEFAULT_ELK_OPTIONS,
      ...(partitionOf && { 'elk.partitioning.activate': 'true' }),
      ...options,
    },
    children: toElkChildren(nodes, undefined, partitionOf),
    edges: edges.map<ElkExtendedEdge>((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };
  const laidOut = await (await getElk()).layout(graph);
  const placed = collectPlacements(laidOut.children ?? []);
  return nodes.map((node) => {
    const p = placed.get(node.id);
    if (!p) return node;
    return { ...node, position: { x: p.x, y: p.y }, width: p.width, height: p.height };
  });
}

function toElkChildren(
  nodes: LayoutNode[],
  parentId: string | undefined,
  partitionOf: PartitionOf | undefined,
): ElkNode[] {
  return nodes
    .filter((n) => n.parentId === parentId)
    .map((n) => {
      const children = toElkChildren(nodes, n.id, undefined);
      const partition = partitionOf?.(n.id);
      return {
        id: n.id,
        ...(children.length > 0 ? { children } : { width: n.width, height: n.height }),
        ...(partition !== undefined && {
          layoutOptions: { 'elk.partitioning.partition': String(partition) },
        }),
      };
    });
}

type Placement = { x: number; y: number; width: number; height: number };

function collectPlacements(children: ElkNode[], into = new Map<string, Placement>()) {
  for (const c of children) {
    into.set(c.id, { x: c.x ?? 0, y: c.y ?? 0, width: c.width ?? 0, height: c.height ?? 0 });
    collectPlacements(c.children ?? [], into);
  }
  return into;
}
