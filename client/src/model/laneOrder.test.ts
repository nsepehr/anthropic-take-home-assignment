import { describe, expect, it } from 'vitest';
import type { Edge, Project } from '@app/shared';
import { seedProject } from '../test/seed';
import { laneIndex } from './lanes';
import { orderLanesByFlow } from './laneOrder';

const seedCategories = laneIndex(seedProject).categoryById;

/** A project whose top-level systems are one per lane, wired with the given lane-to-lane edges. */
function laneProject(lanes: string[], laneEdges: [string, string][]): Project {
  const base = seedProject.systems[0]!;
  const edge = seedProject.edges[0]!;
  return {
    ...seedProject,
    systems: lanes.map((lane) => ({ ...base, id: lane, parentId: undefined, category: lane })),
    edges: laneEdges.map<Edge>(([from, to], i) => ({ ...edge, id: `e${i}`, from, to })),
  };
}
const categories = (lanes: string[]) => new Map(lanes.map((l) => [l, l]));

describe('orderLanesByFlow', () => {
  it('orders the seed along its dependency flow: Workflow → Client UI → Client core → Server → Model', () => {
    const seedOrder = ['Model', 'Server', 'Client core', 'Client UI', 'Workflow'];
    expect(orderLanesByFlow(seedProject, seedCategories, seedOrder)).toEqual([
      'Workflow',
      'Client UI',
      'Client core',
      'Server',
      'Model',
    ]);
  });

  it('follows the edges regardless of seed order', () => {
    const lanes = ['C', 'A', 'B'];
    const project = laneProject(lanes, [
      ['A', 'B'],
      ['B', 'C'],
    ]);
    expect(orderLanesByFlow(project, categories(lanes), lanes)).toEqual(['A', 'B', 'C']);
  });

  it('breaks a cycle by dropping the lightest back-edge', () => {
    const lanes = ['A', 'B', 'C'];
    const project = laneProject(lanes, [
      ['A', 'B'],
      ['A', 'B'],
      ['B', 'C'],
      ['B', 'C'],
      ['C', 'A'],
    ]);
    expect(orderLanesByFlow(project, categories(lanes), lanes)).toEqual(['A', 'B', 'C']);
  });

  it('falls back to seed order when the edges do not decide', () => {
    const lanes = ['Y', 'X', 'Z'];
    expect(orderLanesByFlow(laneProject(lanes, []), categories(lanes), lanes)).toEqual(lanes);
    const project = laneProject(lanes, [
      ['Y', 'Z'],
      ['X', 'Z'],
    ]);
    expect(orderLanesByFlow(project, categories(lanes), lanes)).toEqual(['Y', 'X', 'Z']);
  });
});
