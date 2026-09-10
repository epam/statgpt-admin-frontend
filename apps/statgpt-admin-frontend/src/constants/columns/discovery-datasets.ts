import { ColDef } from 'ag-grid-community';

import { EnumSelectEmptyFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFilter/EnumSelectEmptyFilter';
import { EnumSelectFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFilter/EnumSelectFilter';
import { ValidationStatusCell } from '@/src/components/GridView/ValidationStatusCell/ValidationStatusCell';
import { IndexingStatusCell } from '@/src/components/GridView/IndexingStatusCell/IndexingStatusCell';
import { DiscoveryDatasetActionColumn } from '@/src/components/DiscoveryDatasetsView/ActionColumn/ActionColumn';
import {
  DISCOVERY_INDEXING_STATUS_LABEL,
  DISCOVERY_VALIDATION_STATUS_LABEL,
  DiscoveryIndexingStatus,
  DiscoveryValidationStatus,
} from '@/src/models/discovery-dataset';

// The backend matches agency against a normalized natural-key column with `==`, not a
// substring search, so the filter must be exact-match too - "contains" would silently
// return nothing for a partial name.
const EQUALS_TEXT_FILTER = {
  filterOptions: ['equals'],
  defaultOption: 'equals',
  maxNumConditions: 1,
  debounceMs: 400,
};

export const getDiscoveryDatasetsColumns = (
  onDeleteRow: (id: number) => void,
): ColDef[] => [
  {
    width: 40,
    maxWidth: 40,
    headerCheckboxSelection: true,
    checkboxSelection: true,
    showDisabledCheckboxes: true,
    pinned: 'left',
    sortable: false,
  },
  { field: 'id', headerName: 'ID', width: 90, sortable: false },
  {
    field: 'agency',
    headerName: 'Agency',
    filter: 'agTextColumnFilter',
    filterParams: EQUALS_TEXT_FILTER,
    sortable: false,
  },
  { field: 'datasetId', headerName: 'Dataset ID', sortable: false },
  { field: 'name', headerName: 'Name', sortable: false },
  { field: 'url', headerName: 'URL', sortable: false },
  { field: 'referenceArea', headerName: 'Reference Area', sortable: false },
  {
    field: 'timeCoverage',
    headerName: 'Time Coverage',
    sortable: false,
  },
  {
    field: 'frequencyCoverage',
    headerName: 'Frequency Coverage',
    sortable: false,
  },
  {
    field: 'validationStatus',
    headerName: 'Validation Status',
    cellRenderer: ValidationStatusCell,
    filter: EnumSelectFilter,
    filterParams: {
      values: Object.values(DiscoveryValidationStatus),
      formatValue: (v: string) =>
        DISCOVERY_VALIDATION_STATUS_LABEL[v as DiscoveryValidationStatus] ?? v,
    },
    floatingFilterComponent: EnumSelectEmptyFilter,
    sortable: false,
  },
  {
    field: 'indexingStatus',
    headerName: 'Indexing Status',
    cellRenderer: IndexingStatusCell,
    filter: EnumSelectFilter,
    filterParams: {
      values: Object.values(DiscoveryIndexingStatus),
      formatValue: (v: string) =>
        DISCOVERY_INDEXING_STATUS_LABEL[v as DiscoveryIndexingStatus] ?? v,
    },
    floatingFilterComponent: EnumSelectEmptyFilter,
    sortable: false,
  },
  {
    width: 32,
    maxWidth: 32,
    cellRenderer: DiscoveryDatasetActionColumn,
    cellRendererParams: { onDelete: onDeleteRow },
    cellClass: 'ag-grid__action-column',
    sortable: false,
  },
];
