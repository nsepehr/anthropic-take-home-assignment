import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { seedProject } from '../test/seed';
import { NavigationProvider, useNavigation } from './navigation';
import { ProjectProvider } from './projectStore';
import { SelectionProvider } from './selection';

function Probe() {
  const { scope, breadcrumb } = useNavigation();
  const where = scope.level === 'atlas' ? 'atlas' : scope.id;
  return <p>{`${where}|${breadcrumb.map((c) => c.label).join('/')}`}</p>;
}

function render(trail?: string[]) {
  return renderToString(
    <ProjectProvider initialProject={seedProject}>
      <SelectionProvider>
        <NavigationProvider initialTrail={trail}>
          <Probe />
        </NavigationProvider>
      </SelectionProvider>
    </ProjectProvider>,
  );
}

describe('NavigationProvider', () => {
  it('starts on the atlas with a single Architecture crumb', () => {
    expect(render()).toContain('atlas|Architecture');
  });

  it('exposes the current focus and the trail as crumbs', () => {
    expect(render(['sys-client-shell', 'sys-client-diagram'])).toContain(
      'sys-client-diagram|Architecture/App shell/Diagram canvas',
    );
  });
});
