'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AuditLogTimeRange } from '@/src/models/audit-log';

const FROM = 'created_at_from';
const TO = 'created_at_to';

function normalizeIso(v?: string | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export type AuditLogFilters = AuditLogTimeRange;

export function useAuditLogFiltersInUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: AuditLogFilters = useMemo(() => {
    const created_at_from = normalizeIso(searchParams.get(FROM));
    const created_at_to = normalizeIso(searchParams.get(TO));

    return {
      ...(created_at_from ? { created_at_from } : {}),
      ...(created_at_to ? { created_at_to } : {}),
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (next: AuditLogFilters) => {
      const sp = new URLSearchParams(searchParams.toString());

      if (next.created_at_from) {
        sp.set(FROM, next.created_at_from);
      } else {
        sp.delete(FROM);
      }

      if (next.created_at_to) {
        sp.set(TO, next.created_at_to);
      } else {
        sp.delete(TO);
      }

      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const queryKey = useMemo(
    () => `${filters.created_at_from ?? ''}|${filters.created_at_to ?? ''}`,
    [filters.created_at_from, filters.created_at_to],
  );

  return { filters, setFilters, queryKey };
}
