'use client';

import { useNavigationLoading } from '@/src/context/NavigationLoadingContext';
import { useIsomorphicLayoutEffect } from '@/src/utils/useIsomorphicLayoutEffect';

export function LoadingStateSetter() {
  const { setLoading } = useNavigationLoading();

  useIsomorphicLayoutEffect(() => {
    setLoading(true);
    return () => setLoading(false);
  }, [setLoading]);

  return null;
}
