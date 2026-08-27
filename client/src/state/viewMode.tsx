import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type ViewMode = 'overview' | 'deepDive';

export interface ViewModeState {
  mode: ViewMode;
  toggle: () => void;
  setMode: (mode: ViewMode) => void;
}

const STORAGE_KEY = 'codebase-map:viewMode';

export function parseViewMode(raw: unknown): ViewMode {
  return raw === 'deepDive' ? 'deepDive' : 'overview';
}

function readStoredMode(): ViewMode {
  try {
    return parseViewMode(globalThis.localStorage?.getItem(STORAGE_KEY));
  } catch {
    return 'overview';
  }
}

function storeMode(mode: ViewMode) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, mode);
  } catch {
    // storage unavailable (private mode, SSR): the mode still works for this session
  }
}

const ViewModeContext = createContext<ViewModeState | null>(null);

/** Global overview / deep-dive switch, persisted in localStorage. */
export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>(readStoredMode);
  const setMode = useCallback((next: ViewMode) => {
    storeMode(next);
    setModeState(next);
  }, []);
  const toggle = useCallback(
    () => setMode(mode === 'overview' ? 'deepDive' : 'overview'),
    [mode, setMode],
  );
  const value = useMemo(() => ({ mode, toggle, setMode }), [mode, toggle, setMode]);
  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode(): ViewModeState {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error('useViewMode must be used inside <ViewModeProvider>');
  return ctx;
}
