import { ColDef } from 'ag-grid-community';
import { Menu } from '@/src/constants/menu';

export enum EntityOperation {
  Configure = 'Configure',
  Delete = 'Delete',
  RecalculateIndex = 'Recalculate indexes',
  Export = 'Export',
  Terms = 'Glossary',
  Jobs = 'Jobs',
  Edit = 'Edit',
  Versions = 'Versions',
}

export const ACTION_COLUMN_CELL_RENDERER_KEY = 'actionColumn';

interface ActionColumnOptions {
  listView: Menu;
  items: EntityOperation[];
  deleteEntity?: (id?: number) => void;
  key?: string;
  onConfigureSaved?: () => void;
}

export const ACTION_COLUMN = ({
  listView,
  items,
  deleteEntity,
  key = ACTION_COLUMN_CELL_RENDERER_KEY,
  onConfigureSaved,
}: ActionColumnOptions): ColDef => ({
  width: 32,
  maxWidth: 32,
  cellRenderer: key,
  cellClass: 'ag-grid__action-column',
  cellRendererParams: {
    listView,
    items,
    deleteEntity,
    onConfigureSaved,
  },
});
