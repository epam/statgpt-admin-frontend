'use client';

import { FC, useEffect, useState } from 'react';

import { GridView } from '@/src/components/GridView/GridView';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { useAccessControl } from '@/src/context/AccessControlContext';
import { usePageInitialLoadingSync } from '@/src/context/NavigationLoadingContext';
import { ChannelDatasetVersion } from '@/src/models/channel-dataset-version';
import { PreprocessingStatusCell } from '@/src/components/GridView/PreprocessingStatusCell/PreprocessingStatusCell';
import { RequestData } from '@/src/models/request-data';
import { sendGetRequest } from '@/src/server/api';
import {
  CHANNEL_DATA_SETS_URL,
  CHANNEL_DATASET_VERSIONS_URL,
} from '@/src/server/channels-api';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { ChannelDataset } from '@/src/models/channel-dataset';

interface Props {
  channelId: string;
  datasetId: string;
}

const GRID_COLUMNS = [
  { field: 'version', headerName: 'Version', filter: 'agNumberColumnFilter' },
  {
    field: 'preprocessing_status',
    headerName: 'Status',
    filter: 'agTextColumnFilter',
    cellRenderer: PreprocessingStatusCell,
    cellStyle: { overflow: 'visible' },
    tooltipValueGetter: () => undefined,
  },
  {
    field: 'creation_reason',
    headerName: 'Creation Reason',
    filter: 'agTextColumnFilter',
  },
  {
    field: 'created_at',
    headerName: 'Created At',
    filter: 'agTextColumnFilter',
    valueFormatter: ({ value }: { value: string | null }) =>
      value ? new Date(value).toLocaleString() : '',
  },
  {
    field: 'updated_at',
    headerName: 'Updated At',
    filter: 'agTextColumnFilter',
    valueFormatter: ({ value }: { value: string | null }) =>
      value ? new Date(value).toLocaleString() : '',
  },
  {
    field: 'indexing_stats.harmonization',
    headerName: 'Harmonization Errors',
    filter: 'agTextColumnFilter',
    valueFormatter: ({
      value,
    }: {
      value: NonNullable<
        ChannelDatasetVersion['indexing_stats']
      >['harmonization'];
    }) =>
      value != null ? `Total: ${value.total}. Errors: ${value.errors}` : '',
  },
  {
    field: 'indexing_stats.normalization',
    headerName: 'Normalization Errors',
    filter: 'agTextColumnFilter',
    valueFormatter: ({
      value,
    }: {
      value: NonNullable<
        ChannelDatasetVersion['indexing_stats']
      >['normalization'];
    }) =>
      value != null ? `Total: ${value.total}. Errors: ${value.errors}` : '',
  },
];

export const DatasetVersions: FC<Props> = ({ channelId, datasetId }) => {
  const withNotification = useApiNotification();
  const { setForbidden } = useAccessControl();

  const [versions, setVersions] = useState<ChannelDatasetVersion[]>([]);
  const [datasetTitle, setDatasetTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  usePageInitialLoadingSync(isLoading);

  useEffect(() => {
    if (!channelId || !datasetId) return;

    sendGetRequest<RequestData<ChannelDataset>>(
      CHANNEL_DATA_SETS_URL(channelId),
    ).then((result) => {
      if (result.ok) {
        const match = result.data.data.find(
          (ds) => String(ds.dataset_id) === datasetId,
        );
        if (match) setDatasetTitle(match.dataset.title);
      }
    });
  }, [channelId, datasetId]);

  useEffect(() => {
    if (!channelId || !datasetId) return;

    setIsLoading(true);
    withNotification(
      sendGetRequest<RequestData<ChannelDatasetVersion>>(
        CHANNEL_DATASET_VERSIONS_URL(channelId, datasetId),
      ),
      'Failed to Load Versions',
      [403],
    ).then((result) => {
      setIsLoading(false);
      if (!result.ok && result.error.status === 403) {
        setForbidden();
        return;
      }
      if (result.ok) {
        setVersions(result.data.data);
      }
    });
  }, [channelId, datasetId]);

  return isLoading ? (
    <div className="flex items-center w-full justify-center h-full">
      <Loader />
    </div>
  ) : (
    <div className="bg-layer-2 flex flex-col h-full common-paddings">
      <h1 className="mb-6">
        {datasetTitle ? `${datasetTitle}: Versions` : 'Dataset Versions'}
      </h1>
      <div className="flex-1 min-h-0">
        <GridView
          data={versions}
          colDefs={GRID_COLUMNS}
          emptyDataTitle="No Versions"
        />
      </div>
    </div>
  );
};
