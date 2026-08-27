import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
 * resets the selection to the new focus (or nothing on the atlas) and drops any hover. Esc goes
 * back one hop.
 */
export function NavigationProvider({ children, initialTrail = [] }: Props) {
  const { project } = useProject();
  const { select, clear, hover } = useSelection();
  const [trail, setTrail] = useState(initialTrail);
  // The actions read the latest trail through a ref so their identities never change.
  const trailRef = useRef(trail);
  trailRef.current = trail;

  const apply = useCallback(
    (next: string[]) => {
      setTrail(next);
      hover(null); // the canvas under the pointer is about to be replaced; no leave event fires
      const focus = next[next.length - 1];
      if (focus === undefined) clear();
      else select(focus);
    },
    [select, clear, hover],
  );
  const open = useCallback((id: string) => apply(openIn(trailRef.current, id)), [apply]);
  const back = useCallback(() => apply(trailRef.current.slice(0, -1)), [apply]);
  const goTo = useCallback((scope: Scope) => apply(trailTo(trailRef.current, scope)), [apply]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && trailRef.current.length > 0) back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [back]);

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
