import type { Project } from '@app/shared';

/** Edge weight between two lanes: how many system edges go from `from`'s lane to `to`'s lane. */
type LaneEdges = Map<string, Map<string, number>>;

/**
 * Pure: order lanes so the diagram reads along the dependency flow. Each round emits the
 * remaining lane with the least incoming weight from the other remaining lanes (zero when the
 * graph is acyclic; in a cycle this drops the lightest back-edges), tie-broken by the larger
 * out-minus-in flow, then by `seedOrder`.
 */
export function orderLanesByFlow(
  project: Project,
  categoryById: Map<string, string>,
  seedOrder: string[],
): string[] {
  const weights = laneEdges(project, categoryById);
  const remaining = [...seedOrder];
  const order: string[] = [];
  while (remaining.length) {
    const scores = new Map(remaining.map((lane) => [lane, flow(lane, remaining, weights)]));
    const next = remaining.reduce((best, lane) => {
      const l = scores.get(lane)!;
      const b = scores.get(best)!;
      if (l.in !== b.in) return l.in < b.in ? lane : best;
      return l.out - l.in > b.out - b.in ? lane : best;
    });
    order.push(next);
    remaining.splice(remaining.indexOf(next), 1);
  }
  return order;
}

function laneEdges(project: Project, categoryById: Map<string, string>): LaneEdges {
  const weights: LaneEdges = new Map();
  for (const edge of project.edges) {
    const from = categoryById.get(edge.from);
    const to = categoryById.get(edge.to);
    if (!from || !to || from === to) continue;
    const row = weights.get(from) ?? new Map<string, number>();
    row.set(to, (row.get(to) ?? 0) + 1);
    weights.set(from, row);
  }
  return weights;
}

/** Weighted in/out degree of `lane` counting only edges to/from lanes still in `among`. */
function flow(lane: string, among: string[], weights: LaneEdges) {
  let out = 0;
  let incoming = 0;
  for (const other of among) {
    if (other === lane) continue;
    out += weights.get(lane)?.get(other) ?? 0;
    incoming += weights.get(other)?.get(lane) ?? 0;
  }
  return { out, in: incoming };
}
