import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { firstRunAfter, type FirstRun } from '../model/hints';
import { useNavigation } from './navigation';

const KEYS: Record<keyof FirstRun, string> = {
  seenOpen: 'codebase-map:seen-open',
  seenWalk: 'codebase-map:seen-walk',
};

/** The only place localStorage is touched; a blocked or absent store reads as "never". */
function load(): FirstRun {
  try {
    return {
      seenOpen: localStorage.getItem(KEYS.seenOpen) === '1',
      seenWalk: localStorage.getItem(KEYS.seenWalk) === '1',
    };
  } catch {
    return { seenOpen: false, seenWalk: false };
  }
}

function persist(done: FirstRun) {
  try {
    for (const key of Object.keys(KEYS) as (keyof FirstRun)[]) {
      if (done[key]) localStorage.setItem(KEYS[key], '1');
    }
  } catch {
    // storage unavailable: the coach-mark simply shows again next visit
  }
}

export interface FirstRunState {
  done: FirstRun;
  /** "Got it": retire the coach-mark of the level being shown. */
  dismiss: (level: 'atlas' | 'system') => void;
}

const FirstRunContext = createContext<FirstRunState | null>(null);

/**
 * Tracks whether the reader has opened a system and walked to a neighbour yet, from the trail;
 * must sit inside <NavigationProvider>.
 */
export function FirstRunProvider({ children }: { children: ReactNode }) {
  const { trail } = useNavigation();
  const [done, setDone] = useState<FirstRun>(load);
  const previous = useRef(trail);

  useEffect(() => {
    const next = firstRunAfter(done, previous.current, trail);
    previous.current = trail;
    if (next !== done) setDone(next);
  }, [trail, done]);

  useEffect(() => persist(done), [done]);

  const value = useMemo<FirstRunState>(
    () => ({
      done,
      dismiss: (level) =>
        setDone((d) => (level === 'atlas' ? { ...d, seenOpen: true } : { ...d, seenWalk: true })),
    }),
    [done],
  );
  return <FirstRunContext.Provider value={value}>{children}</FirstRunContext.Provider>;
}

export function useFirstRun(): FirstRunState {
  const ctx = useContext(FirstRunContext);
  if (!ctx) throw new Error('useFirstRun must be used inside <FirstRunProvider>');
  return ctx;
}
