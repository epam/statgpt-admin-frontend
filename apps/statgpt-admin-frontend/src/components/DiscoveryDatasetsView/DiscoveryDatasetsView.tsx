'use client';

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { GridOptions } from 'ag-grid-community';
import {
  IconFileArrowLeft,
  IconRefreshDot,
  IconTrash,
} from '@tabler/icons-react';
import { createPortal } from 'react-dom';
import memoize from 'lodash/memoize';

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
import { useNotification } from '@/src/context/NotificationContext';
import { NotificationType } from '@/src/models/notification';
import {
  DiscoveryDataset,
  DiscoveryDatasetStats,
} from '@/src/models/discovery-dataset';
import { RequestData } from '@/src/models/request-data';
import { sendDeleteRequest, sendGetRequest } from '@/src/server/api';
import {
  CHANNEL_DISCOVERY_DATASETS_BULK_URL,
  DISCOVERY_DATASET_ID_URL,
  DISCOVERY_DATASETS_BULK_URL,
} from '@/src/server/channels-api';
import { PopUpState } from '@/src/types/modal';
import { getDiscoveryDatasetsColumns } from '@/src/constants/columns/discovery-datasets';
import { getEnumFilterValue, getTextEquals } from '@/src/utils/client/grid';
import {
  DiscoveryDatasetsRequestModel,
  mapDiscoveryDatasetsRequestToQueryString,
} from '@/src/utils/discovery-datasets';
import { UploadModal } from './UploadModal/UploadModal';
import { ReindexConfirmDialog } from './ReindexConfirmDialog/ReindexConfirmDialog';
import { useDiscoveryIndexingJobPolling } from './useDiscoveryIndexingJobPolling';
import { DiscoveryDatasetsStats } from './DiscoveryDatasetsStats/DiscoveryDatasetsStats';

interface Props {
  selectedChannelId: string;
}

export const DiscoveryDatasetsView: FC<Props> = ({ selectedChannelId }) => {
  const { setForbidden } = useAccessControl();
  const withNotification = useApiNotification();
  const { showNotification } = useNotification();
  const [refreshToken, setRefreshToken] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReindexConfirm, setShowReindexConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] =
    useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  usePageInitialLoadingSync(isInitialLoading);
  const [stats, setStats] = useState<DiscoveryDatasetStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    setSelectedIds([]);
  }, [refreshToken]);

  useEffect(() => {
    let cancelled = false;
    setIsStatsLoading(true);

    withNotification(
      sendGetRequest<DiscoveryDatasetStats>(
        `/api/v1/channels/${selectedChannelId}/discovery-datasets/stats`,
      ),
      'Failed to Load Grade C Dataset Stats',
    ).then((result) => {
      if (cancelled) return;
      if (result.ok) setStats(result.data);
      setIsStatsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedChannelId, refreshToken, withNotification]);

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
      sendDeleteRequest<{ item_ids: number[] }, string>(
        DISCOVERY_DATASETS_BULK_URL,
        { item_ids: selectedIds },
      ),
      'Failed to Delete Selected Grade C Datasets',
    ).then((result) => {
      if (result.ok) {
        const deletedCount = (JSON.parse(result.data) as DiscoveryDataset[])
          .length;
        setSelectedIds([]);
        setRefreshToken((x) => x + 1);
        showNotification({
          type: NotificationType.success,
          title: 'Grade C Dataset Records Deleted',
          description: `Deleted ${deletedCount} Grade C dataset record${deletedCount === 1 ? '' : 's'}`,
        });
      }
    });
  }, [withNotification, selectedIds, showNotification]);

  const clearAllDatasets = useCallback(() => {
    withNotification(
      sendDeleteRequest<object, string>(
        CHANNEL_DISCOVERY_DATASETS_BULK_URL(selectedChannelId),
      ),
      'Failed to Clear Grade C Datasets',
    ).then((result) => {
      if (result.ok) {
        const deletedCount = (JSON.parse(result.data) as DiscoveryDataset[])
          .length;
        setRefreshToken((x) => x + 1);
        showNotification({
          type: NotificationType.success,
          title: 'Grade C Dataset Records Deleted',
          description: `Deleted ${deletedCount} Grade C dataset record${deletedCount === 1 ? '' : 's'}`,
        });
      }
    });
  }, [withNotification, selectedChannelId, showNotification]);

  const deleteRow = useCallback(
    (id: number) => {
      withNotification(
        sendDeleteRequest(DISCOVERY_DATASET_ID_URL(id)),
        'Failed to Delete Grade C Dataset',
      ).then((result) => {
        if (result.ok) {
          setRefreshToken((x) => x + 1);
          showNotification({
            type: NotificationType.success,
            title: 'Grade C Dataset Record Deleted',
            description: 'Deleted 1 Grade C dataset record',
          });
        }
      });
    },
    [withNotification, showNotification],
  );

  const columns = useMemo(
    () => getDiscoveryDatasetsColumns(deleteRow),
    [deleteRow],
  );

  const { triggerReindex, isReindexInProgress } =
    useDiscoveryIndexingJobPolling({
      channelId: selectedChannelId,
      onCompleted: () => setRefreshToken((x) => x + 1),
    });

  const fetchDiscoveryDatasetsPage = useCallback(
    async (
      params: DiscoveryDatasetsRequestModel,
    ): Promise<FetchRowsResult<DiscoveryDataset>> => {
      const query = mapDiscoveryDatasetsRequestToQueryString(params);

      const result = await withNotification(
        sendGetRequest<RequestData<DiscoveryDataset>>(
          `/api/v1/channels/${selectedChannelId}/discovery-datasets?${query}`,
        ),
        'Failed to Load Grade C Datasets',
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

  // A floating text filter fires a fetch per debounced keystroke even when the trimmed
  // value hasn't actually changed (e.g. typing extra spaces) - memoizing by the resulting
  // query string skips the redundant request. Rebuilding the memoized function (a fresh
  // cache) on refreshToken means a manual refresh (delete/upload/reindex) still forces a
  // real refetch even with unchanged filters.
  const fetchDiscoveryDatasetsPageMemoized = useMemo(
    () =>
      memoize(
        fetchDiscoveryDatasetsPage,
        mapDiscoveryDatasetsRequestToQueryString,
      ),
    [fetchDiscoveryDatasetsPage, refreshToken],
  );

  const fetchRows = useCallback(
    (args: FetchRowsArgs): Promise<FetchRowsResult<DiscoveryDataset>> => {
      const agency = getTextEquals(args.filterModel, 'agency');
      const validation_status = getEnumFilterValue(
        args.filterModel,
        'validationStatus',
      );
      const indexing_status = getEnumFilterValue(
        args.filterModel,
        'indexingStatus',
      );

      return fetchDiscoveryDatasetsPageMemoized({
        limit: args.limit,
        offset: args.offset,
        agency,
        validation_status,
        indexing_status,
      });
    },
    [fetchDiscoveryDatasetsPageMemoized],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row items-center justify-between mb-3">
        <h3>Accessible Datasets: {stats?.total ?? 0}</h3>
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
            disable={isReindexInProgress}
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
      <DiscoveryDatasetsStats stats={stats} isLoading={isStatsLoading} />
      <div className="flex-1 min-h-0">
        <GridView<DiscoveryDataset>
          colDefs={columns}
          emptyDataTitle="No Grade C datasets"
          fetchRows={fetchRows}
          pageSize={DEFAULT_GRID_PAGE_SIZE}
          refreshToken={refreshToken}
          additionalOptions={gridOptions}
          isLoading={isInitialLoading}
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
        header="Delete selected Grade C datasets"
        description={`This will permanently delete ${selectedIds.length} selected Grade C dataset record${selectedIds.length === 1 ? '' : 's'}.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onClose={(confirmed) => {
          setShowDeleteSelectedConfirm(false);
          if (confirmed) deleteSelected();
        }}
      />
      <ConfirmDialog
        modalState={showClearAllConfirm ? PopUpState.Opened : PopUpState.Closed}
        header="Clear all Grade C datasets"
        description="This will permanently delete all Grade C dataset records for this channel. This action cannot be undone."
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
