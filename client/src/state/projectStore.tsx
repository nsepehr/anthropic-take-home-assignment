import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { currentOnly, type Project } from '@app/shared';
import { fetchProject, type ApiResult } from '../api/project';

export interface ProjectState {
  loading: boolean;
  error: string | null;
  /** What the app renders everywhere: the current entries only. */
  project: Project | null;
  /** Everything the file holds, superseded and withdrawn entries included — for history views. */
  fullProject: Project | null;
}

const ProjectContext = createContext<ProjectState | null>(null);

interface Props {
  children: ReactNode;
  /** Skip fetching and start with this project (tests, server rendering). */
  initialProject?: Project;
}

/** Loads the project once on mount via the API and exposes it to the tree. */
export function ProjectProvider({ children, initialProject }: Props) {
  const [result, setResult] = useState<ApiResult<Project> | null>(
    initialProject ? { ok: true, data: initialProject } : null,
  );

  useEffect(() => {
    if (initialProject) return;
    let cancelled = false;
    fetchProject().then((r) => !cancelled && setResult(r));
    return () => {
      cancelled = true;
    };
  }, [initialProject]);

  const state = useMemo<ProjectState>(() => {
    const full = result?.ok ? result.data : null;
    return {
      loading: result === null,
      error: result?.ok === false ? result.error : null,
      // The filter lives here, once, so no feature has to remember to apply it.
      project: full && currentOnly(full),
      fullProject: full,
    };
  }, [result]);

  return <ProjectContext.Provider value={state}>{children}</ProjectContext.Provider>;
}

export function useProject(): ProjectState {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used inside <ProjectProvider>');
  return ctx;
}
