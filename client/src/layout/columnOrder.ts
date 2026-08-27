/**
 * The vertical order of one atlas column. Stability is the point: a system moves only when the
 * graph around it changes, so a developer who re-opens the atlas sees the same picture.
 */

/** Row a locked system must keep, by id (task 19 supplies these; empty means "free layout"). */
export type PinnedRows = ReadonlyMap<string, number>;

export interface ColumnOrderInput {
  /** Ids of this column's systems, in seed order (their order in `project.systems`). */
  ids: readonly string[];
  /** Row index of every system in the column to the left; empty for the first column. */
  previousRows: ReadonlyMap<string, number>;
  /** Every system connected to `id` by an edge, either direction. */
  neighboursOf: (id: string) => readonly string[];
  /** Locked systems and the row they keep. Out-of-range or colliding pins are ignored. */
  pinned?: PinnedRows;
}

/**
 * Pure: rows for one column, top to bottom. Systems sort by the average row index of their
 * neighbours in the previous column (the barycenter, which is what makes edges run flat), ties
 * broken by seed order. Systems with no neighbour there have no barycenter and keep seed order at
 * the bottom — so a newly modelled system appends instead of shuffling the column. Locked systems
 * are placed at their pinned row first and everyone else fills the gaps around them.
 */
export function orderColumn({
  ids,
  previousRows,
  neighboursOf,
  pinned,
}: ColumnOrderInput): string[] {
  const seedIndex = new Map(ids.map((id, i) => [id, i]));
  const byRow = new Map<number, string>();
  const free: string[] = [];
  for (const id of ids) {
    const row = pinned?.get(id);
    if (isUsableRow(row, ids.length) && !byRow.has(row)) byRow.set(row, id);
    else free.push(id);
  }

  const bary = new Map(free.map((id) => [id, barycenter(id, previousRows, neighboursOf)]));
  free.sort((a, b) => {
    const [x, y] = [bary.get(a)!, bary.get(b)!];
    // Infinity !== Infinity is false, so two neighbourless systems fall through to seed order.
    return x !== y ? x - y : seedIndex.get(a)! - seedIndex.get(b)!;
  });

  let next = 0;
  return ids.map((_, row) => byRow.get(row) ?? free[next++]!);
}

function isUsableRow(row: number | undefined, total: number): row is number {
  return row !== undefined && Number.isInteger(row) && row >= 0 && row < total;
}

/** Average row of `id`'s neighbours in the previous column; `Infinity` when it has none. */
function barycenter(
  id: string,
  previousRows: ReadonlyMap<string, number>,
  neighboursOf: (id: string) => readonly string[],
): number {
  let sum = 0;
  let count = 0;
  for (const neighbour of neighboursOf(id)) {
    const row = previousRows.get(neighbour);
    if (row === undefined) continue;
    sum += row;
    count++;
  }
  return count ? sum / count : Infinity;
}

/** Pure: undirected adjacency over the model's edges — a column reads both of its sides. */
export function adjacency(edges: readonly { from: string; to: string }[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const link = (a: string, b: string) => map.set(a, [...(map.get(a) ?? []), b]);
  for (const { from, to } of edges) {
    link(from, to);
    link(to, from);
  }
  return map;
}
