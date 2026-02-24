import { AUDIT_LOG_DETAILS_CELL_RENDERER_KEY } from '@/src/components/AuditLogs/AuditLogDetails/AuditLogDetailsCellRenderer';
import { EnumSelectFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFilter';
import { EnumSelectFloatingFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFloatingFilter';
import { AuditLog, AuditLogEnumValues } from '@/src/models/audit-log';
import { ColDef } from 'ag-grid-community';

const EQUALS_ONLY_FILTER = {
  filterOptions: ['equals'],
  defaultOption: 'equals',
  suppressAndOrCondition: true,
  debounceMs: 400,
};

export const getAuditLogsColumns = ({
  enums,
}: {
  enums?: AuditLogEnumValues | null;
}): ColDef[] => [
  {
    field: 'action_type',
    headerName: 'Action',
    filter: EnumSelectFilter,
    filterParams: {
      values: enums?.action_types ?? [],
    },
    floatingFilter: true,
    floatingFilterComponent: EnumSelectFloatingFilter,
    floatingFilterComponentParams: {
      values: enums?.action_types ?? [],
    },
  },
  {
    field: 'entity_type',
    headerName: 'Entity type',
    filter: EnumSelectFilter,
    filterParams: {
      values: enums?.entity_types ?? [],
    },
    floatingFilter: true,
    floatingFilterComponent: EnumSelectFloatingFilter,
    floatingFilterComponentParams: {
      values: enums?.entity_types ?? [],
    },
  },
  {
    field: 'entity_id',
    headerName: 'Entity ID',
    filter: 'agTextColumnFilter',
    filterParams: EQUALS_ONLY_FILTER,
  },
  {
    field: 'entity_name',
    headerName: 'Entity name',
  },
  {
    field: 'performed_by_name',
    headerName: 'Initiated',
    valueGetter: ({ data }: { data: AuditLog }) => {
      return data?.performed_by_name ?? data?.performed_by ?? '';
    },
  },
  {
    field: 'trace_id',
    headerName: 'Activity ID',
  },
  {
    field: 'created_at',
    headerName: 'Time',
  },
  {
    width: 32,
    maxWidth: 32,
    cellRenderer: AUDIT_LOG_DETAILS_CELL_RENDERER_KEY,
    cellClass: 'ag-grid__action-column',
  },
];
