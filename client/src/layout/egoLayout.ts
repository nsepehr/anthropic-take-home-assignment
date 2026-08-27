/**
 * Pure layout for the system-focus view (design revision 3): the focus card centered, inbound
 * neighbours stacked in a column on the left, outbound on the right. No ELK: the shape is fixed,
 * only the counts vary.
 */
export interface EgoInput {
  focusId: string;
  inboundIds: string[];
  outboundIds: string[];
}

export interface Placed {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

export interface EgoLayout {
  width: number;
  height: number;
  nodes: Placed[];
}

/** Frame and card measurements from the design; the frame grows when a column is taller. */
export const EGO = {
  frame: { width: 1000, minHeight: 580 },
  margin: 40,
  focus: { width: 260, height: 176 },
  neighbour: { width: 210, height: 152 },
  gap: 18,
} as const;

export function egoLayout({ focusId, inboundIds, outboundIds }: EgoInput): EgoLayout {
  const { frame, margin, focus, neighbour, gap } = EGO;
  const tallest = Math.max(inboundIds.length, outboundIds.length);
  const column = tallest * neighbour.height + Math.max(0, tallest - 1) * gap;
  const height = Math.max(frame.minHeight, column + margin * 2);
  const width = frame.width;

  const stack = (ids: string[], x: number): Placed[] => {
    const total = ids.length * neighbour.height + Math.max(0, ids.length - 1) * gap;
    const top = (height - total) / 2;
    return ids.map((id, i) => ({
      id,
      position: { x, y: top + i * (neighbour.height + gap) },
      ...neighbour,
    }));
  };

  return {
    width,
    height,
    nodes: [
      {
        id: focusId,
        position: { x: (width - focus.width) / 2, y: (height - focus.height) / 2 },
        ...focus,
      },
      ...stack(inboundIds, margin - 10),
      ...stack(outboundIds, width - (margin - 10) - neighbour.width),
    ],
  };
}
