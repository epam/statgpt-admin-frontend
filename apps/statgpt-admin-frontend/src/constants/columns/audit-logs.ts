import { AUDIT_LOG_DETAILS_CELL_RENDERER_KEY } from '@/src/components/AuditLogs/AuditLogDetails/AuditLogDetailsCellRenderer';
import { EnumSelectEmptyFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFilter/EnumSelectEmptyFilter';
import { EnumSelectFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFilter/EnumSelectFilter';
import { AuditLog, AuditLogEnumValues } from '@/src/models/audit-log';
import { ColDef } from 'ag-grid-community';

const CONTAINS_TEXT_FILTER = {
  filterOptions: ['contains'],
  defaultOption: 'contains',
  maxNumConditions: 1,
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
    floatingFilterComponent: EnumSelectEmptyFilter,
  },
  {
    field: 'entity_type',
    headerName: 'Entity type',
    filter: EnumSelectFilter,
    filterParams: {
      values: enums?.entity_types ?? [],
    },
    floatingFilter: true,
    floatingFilterComponent: EnumSelectEmptyFilter,
  },
  {
    field: 'entity_id',
    headerName: 'Entity ID',
    filter: 'agTextColumnFilter',
    filterParams: CONTAINS_TEXT_FILTER,
  },
  {
    field: 'entity_name',
    headerName: 'Entity name',
    filter: 'agTextColumnFilter',
    filterParams: CONTAINS_TEXT_FILTER,
  },
  {
    field: 'performed_by_name',
    headerName: 'Initiated',
    filter: 'agTextColumnFilter',
    filterParams: CONTAINS_TEXT_FILTER,
    valueGetter: ({ data }: { data: AuditLog }) => {
      return data?.performed_by_name ?? data?.performed_by ?? '';
    },
  },
  {
    field: 'trace_id',
    headerName: 'Activity ID',
    filter: 'agTextColumnFilter',
    filterParams: CONTAINS_TEXT_FILTER,
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
