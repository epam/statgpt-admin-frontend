import { GridOptions } from 'ag-grid-community';
import { FC } from 'react';

import { GridView } from '@/src//components/GridView/GridView';
import { DATA_SOURCE_COLUMNS } from '@/src/constants/columns/grid-columns';
import { DataSource } from '@/src/models/data-source';

interface Props {
  data: DataSource[];
  selectDs: (id: number) => void;
}

export const DataSourceStep: FC<Props> = ({ data, selectDs }) => {
  const gridOptions: GridOptions = {
    rowSelection: 'single',
    onRowClicked: (event) => {
      selectDs(event.data.id);
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
