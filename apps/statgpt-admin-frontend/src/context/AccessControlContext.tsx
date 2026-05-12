'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
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

  return (
    <AccessControlContext.Provider
      value={{ setForbidden: () => setIsForbidden(true) }}
    >
      {isForbidden ? <NoAccessView /> : children}
    </AccessControlContext.Provider>
  );
}
