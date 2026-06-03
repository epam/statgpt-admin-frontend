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

import { NoAccessView } from '@/src/components/NoAccess/NoAccessView';

interface AccessControlContextValue {
  setForbidden: () => void;
}

const AccessControlContext = createContext<AccessControlContextValue>({
  setForbidden: () => void 0,
});

export function useAccessControl() {
  return useContext(AccessControlContext);
}

export function AccessControlProvider({ children }: { children: ReactNode }) {
  const [isForbidden, setIsForbidden] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsForbidden(false);
  }, [pathname]);

  const setForbidden = useCallback(() => setIsForbidden(true), []);
  const value = useMemo(() => ({ setForbidden }), [setForbidden]);

  return (
    <AccessControlContext.Provider value={value}>
      {isForbidden ? <NoAccessView /> : children}
    </AccessControlContext.Provider>
  );
}
