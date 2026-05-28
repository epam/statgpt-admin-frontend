import { ColDef } from 'ag-grid-community';
import { FC, useEffect, useState } from 'react';

import { loadProviders } from '@/src/app/data-sources/actions';
import {
  RADIO_SELECT_COLUMN,
  SINGLE_SELECT_GRID_CLASS,
  singleSelectGridOptions,
} from '@/src/components/AddDataSet/singleSelectGridOptions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { GridView } from '@/src/components/GridView/GridView';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { Provider } from '@/src/models/data-source';

interface Props {
  selectedDataSourceId?: number;
  selectedProviderId?: string;
  selectProvider: (id: string) => void;
}

const PROVIDER_COLUMNS: ColDef[] = [
  { field: 'id', headerName: 'Provider ID', filter: 'agTextColumnFilter' },
  { field: 'name', headerName: 'Name', filter: 'agTextColumnFilter' },
];

export const ProviderStep: FC<Props> = ({
  selectedDataSourceId,
  selectedProviderId,
  selectProvider,
}) => {
  const withNotification = useApiNotification();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  const gridOptions = singleSelectGridOptions<Provider>({
    getId: (row) => row.id,
    selectedId: selectedProviderId,
    onSelect: (row) => selectProvider(row.id),
  });

  useEffect(() => {
    if (selectedDataSourceId == null) return;

    setProviders([]);
    setIsLoadingProviders(true);
    withNotification(
      loadProviders(selectedDataSourceId),
      'Failed to Load Providers',
    ).then((result) => {
      setIsLoadingProviders(false);
      if (result.ok) setProviders(result.data.data);
    });
  }, [selectedDataSourceId]);

  return isLoadingProviders ? (
    <div className="flex items-center w-full justify-center h-[633px]">
      <Loader />
    </div>
  ) : (
    <div className="flex flex-col common-paddings border-b border-solid border-b-tertiary">
      <span className="mb-4 small">Select Provider</span>

      <div className={`${SINGLE_SELECT_GRID_CLASS} h-[568px]`}>
        <GridView
          colDefs={[RADIO_SELECT_COLUMN, ...PROVIDER_COLUMNS]}
          data={providers}
          additionalOptions={gridOptions}
          emptyDataTitle="No Providers"
        />
      </div>
    </div>
  );
};
