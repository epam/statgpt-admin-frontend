'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Syncs an active tab value to a URL query param, reading the current
 * value on mount and updating the URL (via history replace, no scroll
 * reset) whenever the tab changes.
 * @param paramName - name of the query param to read/write
 * @param validKeys - allowed values for the tab; anything else falls back to `defaultKey`
 * @param defaultKey - value returned when the param is missing or invalid
 */
export function useTabQueryParam<T extends string>(
  paramName: string,
  validKeys: readonly T[],
  defaultKey: T,
): [T, (key: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawValue = searchParams.get(paramName);
  const activeKey = (validKeys as readonly string[]).includes(rawValue ?? '')
    ? (rawValue as T)
    : defaultKey;

  const setActiveKey = useCallback(
    (key: T) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [paramName, pathname, router, searchParams],
  );

  return [activeKey, setActiveKey];
}
