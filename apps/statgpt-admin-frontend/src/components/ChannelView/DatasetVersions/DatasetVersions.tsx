'use client';

import { FC, useEffect, useState } from 'react';

import { GridView } from '@/src/components/GridView/GridView';
import { useAccessControl } from '@/src/context/AccessControlContext';
import { ChannelDatasetVersion } from '@/src/models/channel-dataset-version';
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
  },
  {
    field: 'creation_reason',
    headerName: 'Creation Reason',
    filter: 'agTextColumnFilter',
  },
  {
    field: 'reason_for_failure',
    headerName: 'Failure Reason',
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
];

export const DatasetVersions: FC<Props> = ({ channelId, datasetId }) => {
  const withNotification = useApiNotification();
  const { setForbidden } = useAccessControl();

  const [versions, setVersions] = useState<ChannelDatasetVersion[]>([]);
  const [datasetTitle, setDatasetTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

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
    if (!channelId || !datasetId || isLoading) return;

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

  return (
    <div className="bg-layer-2 flex flex-col h-full common-paddings">
      <h1 className="mb-4">
        {datasetTitle ? `${datasetTitle} — Versions` : 'Dataset Versions'}
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
