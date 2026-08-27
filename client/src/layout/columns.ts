import type { Project } from '@app/shared';
import { CARD_WIDTH } from '../features/diagram/cardSize';
import type { LaneBounds } from '../model/lanes';
import { adjacency, orderColumn } from './columnOrder';

/**
 * Column geometry from the design (`docs/design/landing-v3.dc.html`): 250px lanes on a 280px
 * pitch, 210px cards, and a label band above the first card. `card.height` is what a card
 * actually renders at on the atlas — `.diagram--atlas .diagram-card` pins it so the layout and
 * the DOM can never drift apart.
 */
export const COLUMN = {
  pitch: 280,
  width: 250,
  card: { width: CARD_WIDTH, height: 124 },
  rowGap: 14,
  labelBand: 26,
  padBottom: 16,
} as const;

export interface ColumnOptions {
  /** Categories left to right — one column each. From `orderLanesByFlow` via `laneIndex`. */
  order: readonly string[];
  /** Systems that keep their row across re-layouts (task 19). */
  lockedIds?: ReadonlySet<string>;
  /** Rows from the previous layout; a locked system is pinned to the row it had there. */
  previous?: ReadonlyMap<string, number>;
}

export interface PlacedCard {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

export interface ColumnLayout {
  nodes: PlacedCard[];
  /** One rectangle per non-empty column, hugging its cards, in `order`. */
  lanes: LaneBounds[];
  /** Row index per system — feed back as `previous` to hold locked systems still. */
  rows: Map<string, number>;
  /** Column index per system; edges inside one column are drawn as arcs, not beziers. */
  columns: Map<string, number>;
}

/**
 * Pure: the whole atlas laid out by one rule — categories are stages, so each becomes a column
 * and its systems stack vertically (`docs/MODELING.md`). Deterministic: same project and order
 * in, same pixels out. Nested systems are left out; they belong to their parent's focus view.
 */
export function columnLayout(project: Project, options: ColumnOptions): ColumnLayout {
  const groups = groupByColumn(project, options.order);
  const neighbours = adjacency(project.edges);
  const layout: ColumnLayout = { nodes: [], lanes: [], rows: new Map(), columns: new Map() };

  let previousRows = new Map<string, number>();
  groups.forEach((ids, column) => {
    if (!ids.length) return;
    const ordered = orderColumn({
      ids,
      previousRows,
      neighboursOf: (id) => neighbours.get(id) ?? [],
      pinned: pinnedRows(ids, options),
    });
    previousRows = new Map(ordered.map((id, row) => [id, row]));
    for (const [id, row] of previousRows) {
      layout.rows.set(id, row);
      layout.columns.set(id, column);
      layout.nodes.push({ id, position: cardPosition(column, row), ...COLUMN.card });
    }
    layout.lanes.push(laneRect(options.order[column]!, column, ids.length));
  });
  return layout;
}

/** Ids per column in seed order. Top-level systems only, and only known categories. */
function groupByColumn(project: Project, order: readonly string[]): string[][] {
  const columnOf = new Map(order.map((category, i) => [category, i]));
  const groups: string[][] = order.map(() => []);
  for (const system of project.systems) {
    if (system.parentId) continue;
    const column = system.category === undefined ? undefined : columnOf.get(system.category);
    if (column !== undefined) groups[column]!.push(system.id);
  }
  return groups;
}

function pinnedRows(ids: readonly string[], { lockedIds, previous }: ColumnOptions) {
  if (!lockedIds?.size || !previous?.size) return undefined;
  const pinned = new Map<string, number>();
  for (const id of ids) {
    const row = lockedIds.has(id) ? previous.get(id) : undefined;
    if (row !== undefined) pinned.set(id, row);
  }
  return pinned;
}

function cardPosition(column: number, row: number) {
  return {
    x: column * COLUMN.pitch + (COLUMN.width - COLUMN.card.width) / 2,
    y: row * (COLUMN.card.height + COLUMN.rowGap),
  };
}

/** The lane background: full column width, hugging the stack under a label band. */
function laneRect(category: string, column: number, count: number): LaneBounds {
  const stack = count * COLUMN.card.height + (count - 1) * COLUMN.rowGap;
  return {
    category,
    x: column * COLUMN.pitch,
    y: -COLUMN.labelBand,
    width: COLUMN.width,
    height: COLUMN.labelBand + stack + COLUMN.padBottom,
  };
}
