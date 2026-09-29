import { ColDef, DoesFilterPassParams } from 'ag-grid-community';

import { Menu } from '@/src/constants/menu';
import {
  BASE_COLUMNS,
  CONNECTION_TYPE_COLUMN,
} from '@/src/constants/columns/common-columns';
import { ACTION_COLUMN, EntityOperation } from '@/src/constants/columns/action';
import { DETAILS_TOOLTIP_KEY } from '@/src/components/GridView/DetailsTooltip/DetailsTooltip';
import { StatusCell } from '@/src/components/GridView/StatusCell/StatusCell';
import { EnumSelectEmptyFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFilter/EnumSelectEmptyFilter';
import { EnumSelectFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFilter/EnumSelectFilter';
import { DataSet } from '@/src/models/data-sets';
import { GridEnumSelectFilterModel } from '@/src/models/grid';
import { getNestedValue } from '@/src/utils/client/grid';
import { generateShortUrn } from '@/src/utils/urn';

const DATA_SOURCE_FIELD = 'data_source.title';

// The dataset's `status.status` (aliased as `preprocessing_status`) is a
// backend-fixed literal (`online` | `offline` | `invalid_config`), so unlike
// "Data Source" (an open-ended, user-defined list we never fully know) it's
// safe to offer as a complete select rather than free-text search.
const DATASET_STATUS_VALUES = ['online', 'offline', 'invalid_config'];

const CONTAINS_TEXT_FILTER = {
  filterOptions: ['contains'],
  defaultOption: 'contains',
  maxNumConditions: 1,
  debounceMs: 400,
};

const toSentenceCase = (value: string) => {
  const normalized = value.replace(/_/g, ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const createEnumFilter = (field: string) => ({
  component: EnumSelectFilter,
  doesFilterPass: (
    params: DoesFilterPassParams<unknown, unknown, GridEnumSelectFilterModel>,
  ): boolean => {
    const model = params.model;
    if (!model?.value) return true;
    return getNestedValue(params.data, field) === model.value;
  },
});

export const DATA_SOURCE_COLUMNS: ColDef[] = [
  ...BASE_COLUMNS,
  CONNECTION_TYPE_COLUMN,
];

export const DATA_SOURCE_COLUMNS_WITH_ACTIONS: ColDef[] = [
  ...DATA_SOURCE_COLUMNS,
  ACTION_COLUMN({
    listView: Menu.DATA_SOURCES,
    items: [EntityOperation.Configure, EntityOperation.Delete],
  }),
];

export const CHANNELS_COLUMNS: ColDef[] = [
  ...BASE_COLUMNS,
  {
    field: 'deployment_id',
    headerName: 'Deployment ID',
  },
  ACTION_COLUMN({
    listView: Menu.CHANNELS,
    items: [
      EntityOperation.Configure,
      EntityOperation.Terms,
      EntityOperation.Jobs,
      EntityOperation.Delete,
      EntityOperation.Export,
    ],
  }),
];

export const DATASET_URN_COLUMN: ColDef<DataSet> = {
  headerName: 'URN',
  filter: 'agTextColumnFilter',
  valueGetter: ({ data }) => {
    const { urn } = data?.details ?? {};
    return urn
      ? generateShortUrn(urn.resourceId, urn.version, urn.agencyId)
      : '';
  },
};

export const getDataSetSelectionColumns = (): ColDef[] => [
  DATASET_URN_COLUMN,
  ...BASE_COLUMNS,
  {
    field: DATA_SOURCE_FIELD,
    headerName: 'Data Source',
    filter: 'agTextColumnFilter',
    filterParams: CONTAINS_TEXT_FILTER,
  },
];

export const getDataSetsColumns = (): ColDef[] => [
  ...getDataSetSelectionColumns(),
  {
    field: 'preprocessing_status',
    headerName: 'Status',
    filter: createEnumFilter('preprocessing_status'),
    filterParams: {
      values: DATASET_STATUS_VALUES,
      formatValue: toSentenceCase,
    },
    floatingFilter: true,
    floatingFilterComponent: EnumSelectEmptyFilter,
    cellRenderer: StatusCell,
    tooltipField: 'status.details',
    tooltipComponent: DETAILS_TOOLTIP_KEY,
  },
];

export const getDataSetsColumnsWithActions = (): ColDef[] => [
  ...getDataSetsColumns(),
  ACTION_COLUMN({
    listView: Menu.DATA_SETS,
    items: [EntityOperation.EditDataset, EntityOperation.Delete],
  }),
];

export const DOCUMENTS_COLUMNS_WITH_ACTIONS: ColDef[] = [
  {
    field: 'display_name',
    headerName: 'Display Name',
    filter: 'agTextColumnFilter',
  },
  {
    field: 'url',
    headerName: 'Url',
    filter: 'agTextColumnFilter',
  },
  {
    field: 'created_at',
    headerName: 'Created At',
    filter: 'agTextColumnFilter',
  },
  {
    field: 'metadata.publication_date',
    headerName: 'Publication Date',
    filter: 'agTextColumnFilter',
  },
  {
    field: 'metadata.publication_type',
    headerName: 'Publication Type',
    filter: 'agTextColumnFilter',
  },
  ACTION_COLUMN({ listView: Menu.DOCUMENTS, items: [EntityOperation.Delete] }),
];
