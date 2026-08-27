import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  EMPTY_SEARCH,
  isMatch,
  matchCount,
  searchProject,
  type SearchResults,
} from '../model/search';
import { useProject } from './projectStore';

export interface Search {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResults;
  /** True while a non-blank query is running; everything below is inert otherwise. */
  active: boolean;
  count: number;
  /** `' is-match'` / `' is-search-muted'` for a card, or `''` while no search is running. */
  matchClass: (id: string) => string;
  /** The items to show in a list: matches only while searching, everything otherwise. */
  filter: <T extends { id: string }>(items: T[]) => T[];
}

const INERT: Search = {
  query: '',
  setQuery: () => {},
  results: EMPTY_SEARCH,
  active: false,
  count: 0,
  matchClass: () => '',
  filter: (items) => items,
};

/** Defaults to inert so a component can render outside the provider (tests, isolated stories). */
const SearchContext = createContext<Search>(INERT);

interface Props {
  children: ReactNode;
  initialQuery?: string;
}

/** Holds the search query and derives the matches; must sit inside <ProjectProvider>. */
export function SearchProvider({ children, initialQuery = '' }: Props) {
  const { project } = useProject();
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => searchProject(project, query), [project, query]);

  const value = useMemo<Search>(() => {
    const active = query.trim() !== '';
    if (!active) return { ...INERT, query, setQuery };
    return {
      query,
      setQuery,
      results,
      active,
      count: matchCount(results),
      matchClass: (id) => (isMatch(results, id) ? ' is-match' : ' is-search-muted'),
      filter: (items) => items.filter((item) => isMatch(results, item.id)),
    };
  }, [query, results]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): Search {
  return useContext(SearchContext);
}
