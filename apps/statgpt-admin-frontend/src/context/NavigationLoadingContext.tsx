'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';

import { useIsomorphicLayoutEffect } from '@/src/utils/useIsomorphicLayoutEffect';

interface NavigationLoadingContextValue {
  isLoading: boolean;
  setLoading: (v: boolean) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextValue>({
  isLoading: true,
  setLoading: () => void 0,
});

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext);
}

export function NavigationLoadingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isLoading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
  }, [pathname]);

  return (
    <NavigationLoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function usePageInitialLoadingSync(isLoading: boolean) {
  const { setLoading } = useContext(NavigationLoadingContext);

  useIsomorphicLayoutEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);
}
