import { FC } from 'react';

import { GridView } from '@/src//components/GridView/GridView';
import {
  RADIO_SELECT_COLUMN,
  SINGLE_SELECT_GRID_CLASS,
  singleSelectGridOptions,
} from '@/src/components/AddDataSet/singleSelectGridOptions';
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
  const gridOptions = singleSelectGridOptions<DataSource>({
    getId: (row) => String(row.id),
    selectedId: selectedId != null ? String(selectedId) : undefined,
    onSelect: (row) => row.id != null && selectDataset(row.id),
  });

  return (
    <div className="flex flex-col common-paddings border-b border-solid border-b-tertiary">
      <span className="mb-4 small">Select Data Source</span>

      <div className={`${SINGLE_SELECT_GRID_CLASS} h-[568px]`}>
        <GridView
          colDefs={[RADIO_SELECT_COLUMN, ...DATA_SOURCE_COLUMNS]}
          data={data}
          additionalOptions={gridOptions}
          emptyDataTitle="No Data Sources"
        />
      </div>
    </div>
  );
};
