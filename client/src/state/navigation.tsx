import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  breadcrumbFor,
  openIn,
  scopeOfTrail,
  trailTo,
  type Crumb,
  type Scope,
} from '../model/scope';
import { useProject } from './projectStore';
import { useSelection } from './selection';

export interface Navigation {
  scope: Scope;
  /** Systems opened so far, last = current focus; empty on the atlas. */
  trail: string[];
  /** Open a system's focus view (appends to the trail, or rewinds to it) and select it. */
  open: (id: string) => void;
  /** One hop back; from the first hop, back to the atlas. */
  back: () => void;
  /** Jump to any crumb. */
  goTo: (scope: Scope) => void;
  breadcrumb: Crumb[];
}

const NavigationContext = createContext<Navigation | null>(null);

interface Props {
  children: ReactNode;
  initialTrail?: string[];
}

/**
 * Holds the trail; must sit inside <ProjectProvider> and <SelectionProvider>. Every scope change
 * resets the selection to the new focus (or nothing on the atlas). Esc goes back one hop.
 */
export function NavigationProvider({ children, initialTrail = [] }: Props) {
  const { project } = useProject();
  const { select, clear } = useSelection();
  const [trail, setTrail] = useState(initialTrail);

  const apply = useCallback(
    (next: string[]) => {
      setTrail(next);
      const focus = next[next.length - 1];
      if (focus === undefined) clear();
      else select(focus);
    },
    [select, clear],
  );
  const open = useCallback((id: string) => apply(openIn(trail, id)), [apply, trail]);
  const back = useCallback(() => apply(trail.slice(0, -1)), [apply, trail]);
  const goTo = useCallback((scope: Scope) => apply(trailTo(trail, scope)), [apply, trail]);

  useEffect(() => {
    if (trail.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [trail.length, back]);

  const value = useMemo<Navigation>(
    () => ({
      scope: scopeOfTrail(trail),
      trail,
      open,
      back,
      goTo,
      breadcrumb: project ? breadcrumbFor(project, trail) : [],
    }),
    [project, trail, open, back, goTo],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): Navigation {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside <NavigationProvider>');
  return ctx;
}
