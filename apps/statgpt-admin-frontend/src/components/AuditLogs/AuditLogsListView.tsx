'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Menu } from '@/src/constants/menu';
import type {
  FetchRowsArgs,
  FetchRowsResult,
} from '@/src/components/GridView/GridView';
import type {
  AuditLog,
  AuditLogDetails,
  AuditLogEnumValues,
  AuditLogRequestModel,
} from '@/src/models/audit-log';
import { AuditLogsHeader } from './AuditLogsHeader';
import type { RequestData } from '@/src/models/request-data';
import { sendGetRequest } from '@/src/server/api';
import { DEFAULT_GRID_PAGE_SIZE } from '@/src/constants/columns/grid';
import { useAuditLogFiltersInUrl } from '@/src/hooks/use-audit-logs-filters-in-url';
import { auditLogRequestToQueryString } from '@/src/utils/audit-logs';
import { getEnumFilterValue, getTextEquals } from '@/src/utils/client/grid';
import { ListContent } from '../ListView/ListContent/ListContent';
import { getAuditLogsColumns } from '@/src/constants/columns/audit-logs';

interface AuditLogsListViewProps {
  enums?: AuditLogEnumValues | null;
}

export function AuditLogsListView({ enums }: AuditLogsListViewProps) {
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

      const entity_type = getEnumFilterValue(args.filterModel, 'entity_type');
      const action_type = getEnumFilterValue(args.filterModel, 'action_type');

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

  const columns = useMemo(() => getAuditLogsColumns({ enums }), [enums]);

  return (
    <div className="flex flex-col h-full rounded bg-layer-2 common-paddings">
      <AuditLogsHeader
        onRefresh={() => setRefreshToken((x) => x + 1)}
        count={totalCount}
      />
      <ListContent<AuditLog>
        colDefs={columns}
        emptyDataTitle="No audit logs"
        menuItem={Menu.AUDIT_LOGS}
        fetchRows={fetchRows}
        pageSize={DEFAULT_GRID_PAGE_SIZE}
        queryKey={queryKey}
        refreshToken={refreshToken}
        withHeader={false}
      />
    </div>
  );
}
