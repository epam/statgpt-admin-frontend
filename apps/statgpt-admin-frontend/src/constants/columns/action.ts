import { ColDef } from 'ag-grid-community';
import { Menu } from '@/src/constants/menu';
import { BaseEntityWithDetails } from '@/src/models/base-entity';

export enum EntityOperation {
  Configure = 'Configure',
  EditDataset = 'Edit dataset',
  Delete = 'Delete',
  RecalculateIndex = 'Recalculate indexes',
  Export = 'Export',
  Terms = 'Glossary',
  DiscoveryDatasets = 'Discovery Datasets',
  Jobs = 'Jobs',
  Details = 'Details',
  Edit = 'Edit',
  AutoUpdateJobs = 'Version checks',
  Versions = 'Versions',
}

export const ACTION_COLUMN_CELL_RENDERER_KEY = 'actionColumn';

interface ActionColumnOptions {
  listView: Menu;
  items: EntityOperation[];
  deleteEntity?: (id?: number) => void;
  key?: string;
  onConfigureSaved?: () => void;
  onConfigureOpen?: (props: {
    entity: BaseEntityWithDetails;
    url: string;
    showNameInput?: boolean;
    title?: string;
  }) => void;
}

export const ACTION_COLUMN = ({
  listView,
  items,
  deleteEntity,
  key = ACTION_COLUMN_CELL_RENDERER_KEY,
  onConfigureSaved,
  onConfigureOpen,
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
    onConfigureOpen,
  },
});
