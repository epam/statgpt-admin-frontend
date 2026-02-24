import { ColDef } from 'ag-grid-community';

import { Menu } from '@/src/constants/menu';
import {
  BASE_COLUMNS,
  CONNECTION_TYPE_COLUMN,
} from '@/src/constants/columns/common-columns';
import { ACTION_COLUMN, EntityOperation } from '@/src/constants/columns/action';

export const DATA_SOURCE_COLUMNS: ColDef[] = [
  ...BASE_COLUMNS,
  CONNECTION_TYPE_COLUMN,
];

export const DATA_SOURCE_COLUMNS_WITH_ACTIONS: ColDef[] = [
  ...DATA_SOURCE_COLUMNS,
  ACTION_COLUMN(Menu.DATA_SOURCES, [
    EntityOperation.Configure,
    EntityOperation.Delete,
  ]),
];

export const CHANNELS_COLUMNS: ColDef[] = [
  ...BASE_COLUMNS,
  {
    field: 'deployment_id',
    headerName: 'Deployment ID',
  },
  ACTION_COLUMN(Menu.CHANNELS, [
    EntityOperation.Configure,
    EntityOperation.Terms,
    EntityOperation.Jobs,
    EntityOperation.Delete,
    EntityOperation.Export,
  ]),
];

export const DATA_SETS_COLUMNS: ColDef[] = [
  ...BASE_COLUMNS,
  {
    field: 'data_source.title',
    headerName: 'Data Source',
  },
  {
    field: 'preprocessing_status',
    headerName: 'Status',
    filter: 'agTextColumnFilter',
  },
];

export const DATA_SETS_COLUMNS_WITH_ACTIONS: ColDef[] = [
  ...DATA_SETS_COLUMNS,
  ACTION_COLUMN(Menu.DATA_SETS, [
    EntityOperation.Configure,
    EntityOperation.RecalculateIndex,
    EntityOperation.Delete,
  ]),
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
  ACTION_COLUMN(Menu.DOCUMENTS, [EntityOperation.Delete]),
];
