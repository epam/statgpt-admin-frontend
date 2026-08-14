'use client';

import { FC, useCallback, useState } from 'react';
import { ColDef } from 'ag-grid-community';
import { IconFileArrowLeft } from '@tabler/icons-react';
import { createPortal } from 'react-dom';

import { useAccessControl } from '@/src/context/AccessControlContext';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import {
  FetchRowsArgs,
  FetchRowsResult,
  GridView,
} from '@/src/components/GridView/GridView';
import { BASE_ICON_PROPS } from '@/src/constants/layout';
import { DEFAULT_GRID_PAGE_SIZE } from '@/src/constants/columns/grid';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { DiscoveryDataset } from '@/src/models/discovery-dataset';
import { RequestData } from '@/src/models/request-data';
import { sendGetRequest } from '@/src/server/api';
import { DiscoveryDatasetActionColumn } from './ActionColumn/ActionColumn';
import { UploadModal } from './UploadModal/UploadModal';

interface Props {
  selectedChannelId: string;
}

const COLUMNS: ColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'agency', headerName: 'Agency' },
  { field: 'datasetId', headerName: 'Dataset ID' },
  { field: 'name', headerName: 'Name' },
  { field: 'description', headerName: 'Description' },
  { field: 'url', headerName: 'URL' },
  { field: 'referenceArea', headerName: 'Reference Area' },
  { field: 'timeCoverage', headerName: 'Time Coverage' },
  { field: 'frequencyCoverage', headerName: 'Frequency Coverage' },
  { field: 'indexingStatus', headerName: 'Indexing Status' },
  {
    width: 32,
    maxWidth: 32,
    cellRenderer: DiscoveryDatasetActionColumn,
    cellClass: 'ag-grid__action-column',
  },
];

export const DiscoveryDatasetsView: FC<Props> = ({ selectedChannelId }) => {
  const { setForbidden } = useAccessControl();
  const withNotification = useApiNotification();
  const [refreshToken, setRefreshToken] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchRows = useCallback(
    async (args: FetchRowsArgs): Promise<FetchRowsResult<DiscoveryDataset>> => {
      const result = await withNotification(
        sendGetRequest<RequestData<DiscoveryDataset>>(
          `/api/v1/channels/${selectedChannelId}/discovery-datasets?limit=${args.limit}&offset=${args.offset}`,
        ),
        'Failed to Load Discovery Datasets',
        [403],
      );

      if (!result.ok) {
        if (result.error.status === 403) {
          setForbidden();
        }
        return { rows: [], total: 0 };
      }

      return { rows: result.data.data, total: result.data.total };
    },
    [selectedChannelId, withNotification, setForbidden],
  );

  return (
    <div className="bg-layer-2 flex flex-col h-full common-paddings">
      <div className="flex flex-row items-center justify-between mb-3">
        <h1 className="mb-4">Discovery Datasets</h1>
        <Button
          cssClass="primary ml-3"
          title="Upload"
          icon={<IconFileArrowLeft {...BASE_ICON_PROPS} />}
          onClick={() => setShowUploadModal(true)}
        />
      </div>
      <div className="flex-1 min-h-0">
        <GridView<DiscoveryDataset>
          colDefs={COLUMNS}
          emptyDataTitle="No discovery datasets"
          fetchRows={fetchRows}
          pageSize={DEFAULT_GRID_PAGE_SIZE}
          refreshToken={refreshToken}
        />
      </div>
      {showUploadModal &&
        createPortal(
          <UploadModal
            channelId={selectedChannelId}
            close={() => setShowUploadModal(false)}
            onUploaded={() => setRefreshToken((x) => x + 1)}
          />,
          document.body,
        )}
    </div>
  );
};
