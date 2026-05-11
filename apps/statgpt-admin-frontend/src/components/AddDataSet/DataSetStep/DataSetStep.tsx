import { GridOptions } from 'ag-grid-community';
import { FC, useEffect, useState } from 'react';

import { loadAvailableDataSets } from '@/src/app/data-sources/actions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { GridView } from '@/src/components/GridView/GridView';
import { BASE_COLUMNS } from '@/src/constants/columns/common-columns';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { DataSet } from '@/src/models/data-sets';

interface Props {
  selectedDataSourceId?: number;
  changeDataSet: (dataset: Pick<DataSet, 'title' | 'details'>) => void;
}

export const DataSetStep: FC<Props> = ({
  selectedDataSourceId,
  changeDataSet,
}) => {
  const withNotification = useApiNotification();
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [isLoadingDs, setIsLoadingDs] = useState(false);

  const gridOptions: GridOptions = {
    rowSelection: 'single',
    onRowSelected: (event) => {
      changeDataSet({
        title: event.data.title,
        details: event.data.details,
      });
    },
  };

  useEffect(() => {
    if (dataSets.length === 0 && !isLoadingDs && selectedDataSourceId != null) {
      setIsLoadingDs(true);

      withNotification(
        loadAvailableDataSets(selectedDataSourceId),
        'Failed to Load Datasets',
      ).then((result) => {
        setIsLoadingDs(false);
        if (result.ok) setDataSets(result.data.data);
      });
    }
  }, [dataSets, selectedDataSourceId, isLoadingDs]);

  return isLoadingDs ? (
    <div className="flex items-center w-full justify-center h-[633px]">
      <Loader />
    </div>
  ) : (
    <div className="flex flex-col common-paddings border-b border-solid border-b-tertiary">
      <span className="mb-4 small">Select Dataset</span>

      <div className="h-[568px]">
        <GridView
          colDefs={BASE_COLUMNS}
          data={dataSets}
          additionalOptions={gridOptions}
          emptyDataTitle="No Datasets"
        />
      </div>
    </div>
  );
};
