'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ListView } from '@/src/components/ListView/ListView';
import { Menu } from '@/src/constants/menu';
import type {
  FetchRowsArgs,
  FetchRowsResult,
} from '@/src/components/GridView/GridView';
import type {
  AuditLog,
  AuditLogDetails,
  AuditLogRequestModel,
} from '@/src/models/audit-log';
import { AUDIT_LOGS_COLUMNS } from '@/src/constants/columns/grid-columns';
import { AuditLogsHeader } from './AuditLogsHeader';
import type { RequestData } from '@/src/models/request-data';
import { sendGetRequest } from '@/src/server/api';
import { DEFAULT_GRID_PAGE_SIZE } from '@/src/constants/columns/grid';
import { useAuditLogFiltersInUrl } from '@/src/hooks/use-audit-logs-filters-in-url';
import { auditLogRequestToQueryString } from '@/src/utils/audit-logs';
import { getTextEquals } from '@/src/utils/client/grid';

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

      const entity_type = getTextEquals(args.filterModel, 'entity_type');
      const action_type = getTextEquals(args.filterModel, 'action_type');
      const entity_id = getTextEquals(args.filterModel, 'entity_id');

      const request: AuditLogRequestModel = {
        offset: args.offset,
        limit: args.limit,
        created_at_from,
        created_at_to,
        ...(entity_type ? { entity_type } : {}),
        ...(action_type ? { action_type } : {}),
        ...(entity_id ? { entity_id } : {}),
      };

      const query = auditLogRequestToQueryString(request);

      const payload = await sendGetRequest<any, RequestData<AuditLogDetails>>(
        `/api/v1/audit-logs?${query}`,
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
        <AuditLogsHeader
          onRefresh={() => setRefreshToken((x) => x + 1)}
          count={totalCount}
        />
      }
      emptyDataTitle="No audit logs"
      menuItem={Menu.AUDIT_LOGS}
      fetchRows={fetchRows}
      pageSize={DEFAULT_GRID_PAGE_SIZE}
      queryKey={queryKey}
      refreshToken={refreshToken}
    />
  );
}
