'use client';

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { ColDef, GridOptions } from 'ag-grid-community';
import {
  IconFileArrowLeft,
  IconRefreshDot,
  IconTrash,
} from '@tabler/icons-react';
import { createPortal } from 'react-dom';

import { useAccessControl } from '@/src/context/AccessControlContext';
import { usePageInitialLoadingSync } from '@/src/context/NavigationLoadingContext';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { ConfirmDialog } from '@/src/components/BaseComponents/ConfirmDialog/ConfirmDialog';
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
import { sendDeleteRequest, sendGetRequest } from '@/src/server/api';
import {
  CHANNEL_DISCOVERY_DATASETS_BULK_URL,
  DISCOVERY_DATASET_ID_URL,
  DISCOVERY_DATASETS_BULK_URL,
} from '@/src/server/channels-api';
import { PopUpState } from '@/src/types/modal';
import { ValidationStatusCell } from '@/src/components/GridView/ValidationStatusCell/ValidationStatusCell';
import { IndexingStatusCell } from '@/src/components/GridView/IndexingStatusCell/IndexingStatusCell';
import { DiscoveryDatasetActionColumn } from './ActionColumn/ActionColumn';
import { UploadModal } from './UploadModal/UploadModal';
import { ReindexConfirmDialog } from './ReindexConfirmDialog/ReindexConfirmDialog';
import { useDiscoveryIndexingJobPolling } from './useDiscoveryIndexingJobPolling';

interface Props {
  selectedChannelId: string;
}

const getColumns = (onDeleteRow: (id: number) => void): ColDef[] => [
  {
    width: 40,
    maxWidth: 40,
    headerCheckboxSelection: true,
    checkboxSelection: true,
    showDisabledCheckboxes: true,
    pinned: 'left',
  },
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'agency', headerName: 'Agency' },
  { field: 'datasetId', headerName: 'Dataset ID' },
  { field: 'name', headerName: 'Name' },
  { field: 'url', headerName: 'URL' },
  { field: 'referenceArea', headerName: 'Reference Area' },
  { field: 'timeCoverage', headerName: 'Time Coverage' },
  { field: 'frequencyCoverage', headerName: 'Frequency Coverage' },
  {
    field: 'validationStatus',
    headerName: 'Validation Status',
    cellRenderer: ValidationStatusCell,
  },
  {
    field: 'indexingStatus',
    headerName: 'Indexing Status',
    cellRenderer: IndexingStatusCell,
  },
  {
    width: 32,
    maxWidth: 32,
    cellRenderer: DiscoveryDatasetActionColumn,
    cellRendererParams: { onDelete: onDeleteRow },
    cellClass: 'ag-grid__action-column',
  },
];

export const DiscoveryDatasetsView: FC<Props> = ({ selectedChannelId }) => {
  const { setForbidden } = useAccessControl();
  const withNotification = useApiNotification();
  const [refreshToken, setRefreshToken] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReindexConfirm, setShowReindexConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] =
    useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  usePageInitialLoadingSync(isInitialLoading);

  useEffect(() => {
    setSelectedIds([]);
  }, [refreshToken]);

  const gridOptions: GridOptions = useMemo(
    () => ({
      rowSelection: 'multiple',
      suppressRowClickSelection: true,
      onRowSelected: (event) => {
        setSelectedIds(
          event.api.getSelectedNodes().map((n) => n.data.id as number),
        );
      },
    }),
    [],
  );

  const deleteSelected = useCallback(() => {
    withNotification(
      sendDeleteRequest(DISCOVERY_DATASETS_BULK_URL, {
        item_ids: selectedIds,
      }),
      'Failed to Delete Selected Discovery Datasets',
    ).then((result) => {
      if (result.ok) setRefreshToken((x) => x + 1);
    });
  }, [withNotification, selectedIds]);

  const clearAllDatasets = useCallback(() => {
    withNotification(
      sendDeleteRequest(CHANNEL_DISCOVERY_DATASETS_BULK_URL(selectedChannelId)),
      'Failed to Clear Discovery Datasets',
    ).then((result) => {
      if (result.ok) setRefreshToken((x) => x + 1);
    });
  }, [withNotification, selectedChannelId]);

  const deleteRow = useCallback(
    (id: number) => {
      withNotification(
        sendDeleteRequest(DISCOVERY_DATASET_ID_URL(id)),
        'Failed to Delete Discovery Dataset',
      ).then((result) => {
        if (result.ok) setRefreshToken((x) => x + 1);
      });
    },
    [withNotification],
  );

  const columns = useMemo(() => getColumns(deleteRow), [deleteRow]);

  const { triggerReindex, isReindexInProgress } =
    useDiscoveryIndexingJobPolling({
      channelId: selectedChannelId,
      onCompleted: () => setRefreshToken((x) => x + 1),
    });

  const fetchRows = useCallback(
    async (args: FetchRowsArgs): Promise<FetchRowsResult<DiscoveryDataset>> => {
      const result = await withNotification(
        sendGetRequest<RequestData<DiscoveryDataset>>(
          `/api/v1/channels/${selectedChannelId}/discovery-datasets?limit=${args.limit}&offset=${args.offset}`,
        ),
        'Failed to Load Discovery Datasets',
        [403],
      );

      setIsInitialLoading(false);

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
        <div className="flex flex-row items-center">
          <Button
            cssClass="secondary"
            title="Reindex"
            icon={<IconRefreshDot {...BASE_ICON_PROPS} />}
            disable={isReindexInProgress}
            onClick={() => setShowReindexConfirm(true)}
          />
          <Button
            cssClass="primary ml-3"
            title="Upload"
            icon={<IconFileArrowLeft {...BASE_ICON_PROPS} />}
            onClick={() => setShowUploadModal(true)}
          />
          <Button
            cssClass="secondary ml-3"
            title={`Delete selected (${selectedIds.length})`}
            icon={<IconTrash {...BASE_ICON_PROPS} />}
            disable={selectedIds.length === 0}
            onClick={() => setShowDeleteSelectedConfirm(true)}
          />
          <Button
            cssClass="secondary ml-3"
            title="Clear all"
            icon={<IconTrash {...BASE_ICON_PROPS} />}
            onClick={() => setShowClearAllConfirm(true)}
          />
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <GridView<DiscoveryDataset>
          colDefs={columns}
          emptyDataTitle="No discovery datasets"
          fetchRows={fetchRows}
          pageSize={DEFAULT_GRID_PAGE_SIZE}
          refreshToken={refreshToken}
          additionalOptions={gridOptions}
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
      <ReindexConfirmDialog
        modalState={showReindexConfirm ? PopUpState.Opened : PopUpState.Closed}
        onClose={({ confirmed, force }) => {
          setShowReindexConfirm(false);
          if (confirmed) triggerReindex(force);
        }}
      />
      <ConfirmDialog
        modalState={
          showDeleteSelectedConfirm ? PopUpState.Opened : PopUpState.Closed
        }
        header="Delete selected discovery datasets"
        description={`This will permanently delete ${selectedIds.length} selected discovery dataset record${selectedIds.length === 1 ? '' : 's'}.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onClose={(confirmed) => {
          setShowDeleteSelectedConfirm(false);
          if (confirmed) deleteSelected();
        }}
      />
      <ConfirmDialog
        modalState={showClearAllConfirm ? PopUpState.Opened : PopUpState.Closed}
        header="Clear all discovery datasets"
        description="This will permanently delete all discovery dataset records for this channel. This action cannot be undone."
        confirmLabel="Clear all"
        cancelLabel="Cancel"
        onClose={(confirmed) => {
          setShowClearAllConfirm(false);
          if (confirmed) clearAllDatasets();
        }}
      />
    </div>
  );
};
