import { ColDef, GridOptions } from 'ag-grid-community';

import { RadioSelectionCellRenderer } from '@/src/components/GridView/RadioSelectionCellRenderer/RadioSelectionCellRenderer';

import styles from './singleSelectGrid.module.scss';

export const SINGLE_SELECT_GRID_CLASS = styles.singleSelectGrid;

interface SingleSelectGridOptionsArgs<T> {
  getId: (row: T) => string;
  selectedId?: string;
  onSelect: (row: T) => void;
}

export const RADIO_SELECT_COLUMN: ColDef = {
  width: 36,
  minWidth: 36,
  maxWidth: 36,
  resizable: false,
  sortable: false,
  filter: false,
  floatingFilter: false,
  suppressMovable: true,
  suppressHeaderMenuButton: true,
  pinned: 'left',
  headerName: '',
  cellRenderer: RadioSelectionCellRenderer,
  cellStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
};

export const singleSelectGridOptions = <T>({
  getId,
  selectedId,
  onSelect,
}: SingleSelectGridOptionsArgs<T>): GridOptions<T> => ({
  rowSelection: {
    mode: 'singleRow',
    checkboxes: false,
    enableClickSelection: true,
  },
  getRowId: (params) => getId(params.data),
  onSelectionChanged: (event) => {
    const selected = event.api.getSelectedRows()[0];
    if (selected) onSelect(selected);
  },
  onFirstDataRendered: (event) => {
    if (selectedId == null) return;
    event.api.forEachNode((node) => {
      if (node.data && getId(node.data) === selectedId) {
        node.setSelected(true);
      }
    });
  },
});
