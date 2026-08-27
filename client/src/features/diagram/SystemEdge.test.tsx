import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Position, ReactFlowProvider, type EdgeProps } from '@xyflow/react';
import type { SystemEdge as SystemEdgeType } from '../../model/toFlow';
import { ProjectProvider } from '../../state/projectStore';
import { SelectionProvider } from '../../state/selection';
import { seedProject } from '../../test/seed';
import { SystemEdge } from './SystemEdge';

const modelEdge = seedProject.edges[0]!;
const props = {
  id: modelEdge.id,
  source: modelEdge.from,
  target: modelEdge.to,
  label: 'talks to',
  data: { edge: modelEdge },
  sourceX: 0,
  sourceY: 0,
  targetX: 100,
  targetY: 50,
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
} as EdgeProps<SystemEdgeType>;

function render(selectedId?: string) {
  return renderToString(
    <ProjectProvider initialProject={seedProject}>
      <SelectionProvider initialSelectedId={selectedId}>
        <ReactFlowProvider>
          <svg>
            <SystemEdge {...props} />
          </svg>
        </ReactFlowProvider>
      </SelectionProvider>
    </ProjectProvider>,
  );
}

describe('SystemEdge', () => {
  it('draws a path with an arrowhead and never a label', () => {
    const html = render();
    expect(html).toContain('marker-end="url(#diagram-arrow)"');
    expect(html).not.toContain('talks to');
    expect(html).toContain('is-idle');
  });

  it('lights up with the accent arrowhead when selected', () => {
    const html = render(modelEdge.id);
    expect(html).toContain('marker-end="url(#diagram-arrow-lit)"');
    expect(html).toContain('is-selected');
  });
});
