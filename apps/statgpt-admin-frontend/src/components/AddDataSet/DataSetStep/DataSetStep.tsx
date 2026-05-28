import { ColDef, GridOptions } from 'ag-grid-community';
import { FC, useEffect, useState } from 'react';

import { loadAvailableDataSets } from '@/src/app/data-sources/actions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { GridView } from '@/src/components/GridView/GridView';
import { BASE_COLUMNS } from '@/src/constants/columns/common-columns';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { DataSet } from '@/src/models/data-sets';
import { generateShortUrn } from '@/src/utils/urn';

interface Props {
  selectedDataSourceId?: number;
  selectedProviderId?: string;
  selectedTitle?: string;
  changeDataSet: (dataset: Pick<DataSet, 'title' | 'details'>) => void;
}

const DATASET_URN_COLUMN: ColDef = {
  headerName: 'URN',
  filter: 'agTextColumnFilter',
  valueGetter: ({ data }: { data: DataSet }) => {
    const { urn } = data?.details ?? {};
    return generateShortUrn(urn?.resourceId, urn?.version, urn?.agencyId);
  },
};

export const DataSetStep: FC<Props> = ({
  selectedDataSourceId,
  selectedProviderId,
  selectedTitle,
  changeDataSet,
}) => {
  const withNotification = useApiNotification();
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [isLoadingDs, setIsLoadingDs] = useState(false);

  const gridOptions: GridOptions = {
    rowSelection: {
      mode: 'singleRow',
      checkboxes: true,
      enableClickSelection: true,
    },
    getRowId: (params) => String(params.data.title),
    onSelectionChanged: (event) => {
      const selected = event.api.getSelectedRows()[0];
      if (selected) {
        changeDataSet({
          title: selected.title,
          details: selected.details,
        });
      }
    },
    onFirstDataRendered: (event) => {
      if (!selectedTitle) return;
      event.api.forEachNode((node) => {
        if (node.data?.title === selectedTitle) node.setSelected(true);
      });
    },
  };

  useEffect(() => {
    if (selectedDataSourceId == null || selectedProviderId == null) return;

    setDataSets([]);
    setIsLoadingDs(true);
    withNotification(
      loadAvailableDataSets(selectedDataSourceId, selectedProviderId),
      'Failed to Load Datasets',
    ).then((result) => {
      setIsLoadingDs(false);
      if (result.ok) setDataSets(result.data.data);
    });
  }, [selectedDataSourceId, selectedProviderId]);

  return isLoadingDs ? (
    <div className="flex items-center w-full justify-center h-[633px]">
      <Loader />
    </div>
  ) : (
    <div className="flex flex-col common-paddings border-b border-solid border-b-tertiary">
      <span className="mb-4 small">Select Dataset</span>

      <div className="h-[568px]">
        <GridView
          colDefs={[DATASET_URN_COLUMN, ...BASE_COLUMNS]}
          data={dataSets}
          additionalOptions={gridOptions}
          emptyDataTitle="No Datasets"
        />
      </div>
    </div>
  );
};
