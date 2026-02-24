'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ListView } from '@/src/components/ListView/ListView';
import { Menu } from '@/src/constants/menu';
import type {
  FetchRowsArgs,
  FetchRowsResult,
} from '@/src/components/GridView/GridView';
import type { AuditLog, AuditLogDetails } from '@/src/models/audit-log';
import { AUDIT_LOGS_COLUMNS } from '@/src/constants/columns/grid-columns';
import { AuditLogsHeader } from './AuditLogsHeader';
import type { RequestData } from '@/src/models/request-data';
import { sendGetRequest } from '@/src/server/api';
import { DEFAULT_GRID_PAGE_SIZE } from '@/src/constants/columns/grid';
import { useAuditLogFiltersInUrl } from '@/src/hooks/use-audit-logs-filters-in-url';

export function AuditLogsListView() {
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

  const { filters, queryKey } = useAuditLogFiltersInUrl();
  const [refreshToken, setRefreshToken] = useState(0);

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
    setTotalCount(undefined);
  }, [filters]);

  const fetchRows = useCallback(
    async (args: FetchRowsArgs): Promise<FetchRowsResult<AuditLog>> => {
      const { created_at_from, created_at_to } = filtersRef.current;

      const query = new URLSearchParams({
        offset: String(args.offset),
        limit: String(args.limit),
      });

      if (created_at_from) query.set('created_at_from', created_at_from);
      if (created_at_to) query.set('created_at_to', created_at_to);

      const payload = await sendGetRequest<any, RequestData<AuditLogDetails>>(
        `/api/v1/audit-logs?${query.toString()}`,
      );

      if (!payload || !payload.data) {
        setTotalCount(0);
        return { rows: [], total: 0 };
      }

      const rows = payload.data ?? payload.results ?? [];
      const total =
        typeof payload.total === 'number' ? payload.total : payload.count;

      setTotalCount(total);
      return { rows, total };
    },
    [],
  );

  return (
    <ListView<AuditLog>
      colDefs={AUDIT_LOGS_COLUMNS}
      customHeader={
        <AuditLogsHeader onRefresh={() => setRefreshToken((x) => x + 1)} />
      }
      emptyDataTitle="No audit logs"
      menuItem={Menu.AUDIT_LOGS}
      fetchRows={fetchRows}
      totalCount={totalCount}
      pageSize={DEFAULT_GRID_PAGE_SIZE}
      queryKey={queryKey}
      refreshToken={refreshToken}
    />
  );
}
