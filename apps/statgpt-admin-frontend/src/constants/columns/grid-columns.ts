import { ColDef, IDoesFilterPassParams } from 'ag-grid-community';

import { Menu } from '@/src/constants/menu';
import {
  BASE_COLUMNS,
  CONNECTION_TYPE_COLUMN,
} from '@/src/constants/columns/common-columns';
import { ACTION_COLUMN, EntityOperation } from '@/src/constants/columns/action';
import { DETAILS_TOOLTIP_KEY } from '@/src/components/GridView/DetailsTooltip/DetailsTooltip';
import { StatusCell } from '@/src/components/GridView/StatusCell/StatusCell';
import { CheckboxFilter } from '@/src/components/GridView/CustomFilters/CheckboxFilter/CheckboxFilter';
import { CheckboxEmptyFilter } from '@/src/components/GridView/CustomFilters/CheckboxFilter/CheckboxEmptyFilter';
import { GridCheckboxFilterModel } from '@/src/models/grid';
import { getNestedValue } from '@/src/utils/client/grid';

const DATA_SOURCE_FIELD = 'data_source.title';

const dataSourceDoesFilterPass = (
  params: IDoesFilterPassParams & { model?: GridCheckboxFilterModel },
): boolean => {
  const model = params.model;
  if (!model || !model.values.length) return true;
  return model.values.includes(getNestedValue(params.data, DATA_SOURCE_FIELD));
};

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

export const getDataSetsColumns = (dataSources: string[]): ColDef[] => [
  ...BASE_COLUMNS,
  {
    field: DATA_SOURCE_FIELD,
    headerName: 'Data Source',
    filter: {
      component: CheckboxFilter,
      doesFilterPass: dataSourceDoesFilterPass,
    },
    filterParams: { values: dataSources },
    floatingFilterComponent: CheckboxEmptyFilter,
  },
  {
    field: 'preprocessing_status',
    headerName: 'Status',
    filter: 'agTextColumnFilter',
    cellRenderer: StatusCell,
    tooltipField: 'status.details',
    tooltipComponent: DETAILS_TOOLTIP_KEY,
  },
];

export const getDataSetsColumnsWithActions = (
  dataSources: string[],
): ColDef[] => [
  ...getDataSetsColumns(dataSources),
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
