import { ColDef } from 'ag-grid-community';

export const NAME_COLUMN: ColDef = {
  field: 'title',
  headerName: 'Name',
  filter: 'agTextColumnFilter',
};

export const DESCRIPTION_COLUMN: ColDef = {
  field: 'description',
  headerName: 'Description',
  filter: 'agTextColumnFilter',
};

export const CONNECTION_TYPE_COLUMN: ColDef = {
  field: 'type.name',
  headerName: 'Connection Type',
  filter: 'agTextColumnFilter',
};

export const BASE_COLUMNS: ColDef[] = [NAME_COLUMN, DESCRIPTION_COLUMN];
