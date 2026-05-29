'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';

export interface BreadcrumbEntry {
  name: string;
  href?: string;
}

interface BreadcrumbContextValue {
  breadcrumbs: BreadcrumbEntry[];
  setBreadcrumbs: (crumbs: BreadcrumbEntry[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

const EMPTY: BreadcrumbEntry[] = [];

function useBreadcrumbContext(): BreadcrumbContextValue {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error(
      'useBreadcrumbs/useSetBreadcrumbs must be used within a BreadcrumbProvider',
    );
  }
  return ctx;
}

export function useBreadcrumbs(): BreadcrumbEntry[] {
  return useBreadcrumbContext().breadcrumbs;
}

export function useSetBreadcrumbs(crumbs: BreadcrumbEntry[]) {
  const { setBreadcrumbs } = useBreadcrumbContext();
  const key = crumbs.map((c) => `${c.name} ${c.href ?? ''}`).join('');

  useEffect(() => {
    setBreadcrumbs(crumbs);
  }, [key, setBreadcrumbs]);
}

function shallowEqual(a: BreadcrumbEntry[], b: BreadcrumbEntry[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].name !== b[i].name || a[i].href !== b[i].href) return false;
  }
  return true;
}

interface BreadcrumbState {
  pathname: string;
  crumbs: BreadcrumbEntry[];
}

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<BreadcrumbState>({ pathname, crumbs: [] });

  const setBreadcrumbs = useCallback(
    (next: BreadcrumbEntry[]) => {
      setState((prev) =>
        prev.pathname === pathname && shallowEqual(prev.crumbs, next)
          ? prev
          : { pathname, crumbs: next },
      );
    },
    [pathname],
  );

  const breadcrumbs = state.pathname === pathname ? state.crumbs : EMPTY;

  const value = useMemo(
    () => ({ breadcrumbs, setBreadcrumbs }),
    [breadcrumbs, setBreadcrumbs],
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}
