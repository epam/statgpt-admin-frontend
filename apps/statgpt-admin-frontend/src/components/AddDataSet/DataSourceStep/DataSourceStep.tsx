import { GridOptions } from 'ag-grid-community';
import { FC } from 'react';

import { GridView } from '@/src//components/GridView/GridView';
import { DATA_SOURCE_COLUMNS } from '@/src/constants/columns/grid-columns';
import { DataSource } from '@/src/models/data-source';

interface Props {
  data: DataSource[];
  selectedId?: number;
  selectDataset: (id: number) => void;
}

export const DataSourceStep: FC<Props> = ({
  data,
  selectedId,
  selectDataset,
}) => {
  const gridOptions: GridOptions = {
    rowSelection: {
      mode: 'singleRow',
      checkboxes: true,
      enableClickSelection: true,
    },
    getRowId: (params) => String(params.data.id),
    onSelectionChanged: (event) => {
      const selected = event.api.getSelectedRows()[0];
      if (selected) selectDataset(selected.id);
    },
    onFirstDataRendered: (event) => {
      if (selectedId == null) return;
      event.api.forEachNode((node) => {
        if (node.data?.id === selectedId) node.setSelected(true);
      });
    },
  };

  return (
    <div className="flex flex-col common-paddings border-b border-solid border-b-tertiary">
      <span className="mb-4 small">Select Data Source</span>

      <div className="h-[568px]">
        <GridView
          colDefs={DATA_SOURCE_COLUMNS}
          data={data}
          additionalOptions={gridOptions}
          emptyDataTitle="No Data Sources"
        />
      </div>
    </div>
  );
};
