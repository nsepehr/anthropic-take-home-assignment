import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useProject } from './projectStore';
import { deriveSelection, type SelectionView } from '../model/selection';

export interface Selection extends SelectionView {
  select: (id: string) => void;
  clear: () => void;
}

const SelectionContext = createContext<Selection | null>(null);

interface Props {
  children: ReactNode;
  initialSelectedId?: string;
}

/** Holds the single selected entity id; must sit inside <ProjectProvider>. */
export function SelectionProvider({ children, initialSelectedId }: Props) {
  const { project } = useProject();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const select = useCallback((id: string) => setSelectedId(id), []);
  const clear = useCallback(() => setSelectedId(null), []);

  const value = useMemo<Selection>(
    () => ({ ...deriveSelection(project, selectedId), select, clear }),
    [project, selectedId, select, clear],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): Selection {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used inside <SelectionProvider>');
  return ctx;
}
