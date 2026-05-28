'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  deduplicateDataset,
  exportChannel,
  getChannelIndexStatus,
} from '@/src/app/channels/actions';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { DataSetChannelResults } from '@/src/components/EditDataEntity/DataSetChannelResults';
import { EditDataEntity } from '@/src/components/EditDataEntity/EditDataEntity';
import { GridView } from '@/src/components/GridView/GridView';
import { ACTION_COLUMN, EntityOperation } from '@/src/constants/columns/action';
import { Menu } from '@/src/constants/menu';
import { useAccessControl } from '@/src/context/AccessControlContext';
import { useNotification } from '@/src/context/NotificationContext';
import { BaseEntityWithDetails } from '@/src/models/base-entity';
import {
  ChannelResult,
  DataSet,
  DataSetUpdateResponse,
} from '@/src/models/data-sets';
import { ChannelDataset } from '@/src/models/channel-dataset';
import { ChannelIndexStatus } from '@/src/models/channel-index-status';
import { NotificationType } from '@/src/models/notification';
import { RequestData } from '@/src/models/request-data';
import {
  sendDeleteRequest,
  sendGetRequest,
  sendPostRequest,
} from '@/src/server/api';
import {
  CHANNEL_DATA_SETS_URL,
  RELOAD_ALL_DATASETS_CHANNEL_URL,
  RELOAD_DATASET_CHANNEL_URL,
} from '@/src/server/channels-api';
import { AddDatasets } from '../AddDataSets/AddDataSets';
import { ConfirmDialog } from '@/src/components/BaseComponents/ConfirmDialog/ConfirmDialog';
import { PopUpState } from '@/src/types/modal';
import {
  IconFileArrowRight,
  IconPlus,
  IconRefreshDot,
} from '@tabler/icons-react';
import { BASE_ICON_PROPS } from '@/src/constants/layout';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { DETAILS_TOOLTIP_KEY } from '@/src/components/GridView/DetailsTooltip/DetailsTooltip';
import { StatusCell } from '@/src/components/GridView/StatusCell/StatusCell';
import {
  Menu as DropdownMenu,
  MenuItem as DropdownMenuItem,
} from '@/src/components/BaseComponents/Dropdown/DropdownMenu';
import ArrowUpIcon from '@/public/icons/arrow-up.svg';
import { DeduplicationAlert } from './DeduplicationAlert';
import { DeduplicationStatsModal } from './DeduplicationStatsModal';
import { ColDef, ITooltipParams, ValueGetterParams } from 'ag-grid-community';

interface Props {
  selectedChannelId?: string;
}

export const DataSetsView: FC<Props> = ({ selectedChannelId }) => {
  const { showNotification, removeNotification } = useNotification();
  const withNotification = useApiNotification();
  const { setForbidden } = useAccessControl();

  const [showAddDatasetsModal, setShowAddDatasetsModal] = useState(false);
  const [pendingRecalculateMode, setPendingRecalculateMode] = useState<
    'sequential' | 'parallel' | null
  >(null);
  const [isRecalculateMenuOpen, setIsRecalculateMenuOpen] = useState(false);
  const [isLoadingChannelDataSets, setIsLoadingChannelDataSets] =
    useState(true);
  const isFetchingRef = useRef(false);

  const [selectedChannelDataSets, setSelectedChannelDataSets] = useState<
    DataSet[]
  >([]);

  const [indexStatus, setIndexStatus] = useState<ChannelIndexStatus | null>(
    null,
  );

  const [configureProps, setConfigureProps] = useState<{
    entity: BaseEntityWithDetails;
    url: string;
    showNameInput?: boolean;
    title?: string;
  } | null>(null);

  const onConfigureOpen = useCallback(
    (props: {
      entity: BaseEntityWithDetails;
      url: string;
      showNameInput?: boolean;
      title?: string;
    }) => {
      setConfigureProps(props);
    },
    [],
  );

  const renderDataSetResults = useCallback((responseData: unknown) => {
    const results = (responseData as DataSetUpdateResponse)?.channel_results;
    if (!results?.length) return null;
    return (
      <DataSetChannelResults channelResults={results as ChannelResult[]} />
    );
  }, []);

  const updateDataSet = useCallback(() => {
    if (selectedChannelId != null && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setIsLoadingChannelDataSets(true);
      withNotification(
        sendGetRequest<RequestData<DataSet>>(
          CHANNEL_DATA_SETS_URL(selectedChannelId),
        ),
        'Failed to Load Datasets',
        [403],
      ).then((result) => {
        isFetchingRef.current = false;
        setIsLoadingChannelDataSets(false);
        if (!result.ok && result.error.status === 403) {
          setForbidden();
          return;
        }
        if (result.ok) {
          setSelectedChannelDataSets([...result.data.data]);
        }
      });
    }
  }, [selectedChannelId, withNotification]);

  const deleteDataSet = (id?: number) => {
    setIsLoadingChannelDataSets(true);
    withNotification(
      sendDeleteRequest(
        CHANNEL_DATA_SETS_URL(
          `${selectedChannelId as string}__${id as number}`,
        ),
      ),
      'Delete Failed',
    ).then((result) => {
      if (result.ok) {
        updateDataSet();
      } else {
        setIsLoadingChannelDataSets(false);
      }
    });
  };

  const exportEntity = () => {
    const id = showNotification({
      type: NotificationType.loading,
      title: 'Export channel',
      description: 'Preparing export files',
      duration: undefined,
    });
    exportChannel(selectedChannelId || '').then((result) => {
      removeNotification(id);
      if (result.ok) {
        window.open(`/${result.data}`, '_blank');
      } else {
        showNotification({
          type: NotificationType.error,
          title: 'Export Failed',
          description: result.error.message,
        });
      }
    });
  };

  const gridColumns: ColDef[] = [
    {
      field: 'dataset.title',
      headerName: 'Name',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'dataset.description',
      headerName: 'Description',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'dataset.data_source.title',
      headerName: 'Data Source',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'dataset.status.status',
      headerName: 'Dataset Status',
      filter: 'agTextColumnFilter',
      cellRenderer: StatusCell,
      tooltipField: 'dataset.status.details',
      tooltipComponent: DETAILS_TOOLTIP_KEY,
    },
    {
      field: 'last_completed_version.version',
      headerName: 'Completed Version',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'last_completed_version.updated_at',
      headerName: 'Completed At',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'latest_version.version',
      headerName: 'Latest Version',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'latest_version.updated_at',
      headerName: 'Latest Updated',
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: { value: string | null }) =>
        value ? new Date(value).toLocaleString() : '',
    },
    {
      field: 'latest_version.preprocessing_status',
      headerName: 'Latest Status',
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Last check',
      valueGetter: (params: ValueGetterParams) => {
        const job = (params.data as ChannelDataset)?.last_auto_update_job;
        if (!job) return '';
        const label = job.status !== 'COMPLETED' ? job.status : job.result;
        const date = job.updated_at
          ? new Date(job.updated_at).toLocaleString()
          : '';
        return [label, date].filter(Boolean).join(' | ');
      },
      tooltipValueGetter: (params: ITooltipParams) => {
        const job = (params.data as ChannelDataset)?.last_auto_update_job;
        if (!job) return null;
        return job.details || job.reason_for_failure || null;
      },
      tooltipComponent: DETAILS_TOOLTIP_KEY,
    },
    ACTION_COLUMN({
      listView: Menu.CHANNEL_DATASETS,
      items: [
        EntityOperation.EditDataset,
        EntityOperation.AutoUpdateJobs,
        EntityOperation.Versions,
        EntityOperation.RecalculateIndex,
        EntityOperation.Delete,
      ],
      deleteEntity: deleteDataSet.bind(this),
      onConfigureSaved: updateDataSet,
      onConfigureOpen,
    }),
  ];

  const deduplicate = useCallback(() => {
    withNotification(
      deduplicateDataset(selectedChannelId as string),
      'Deduplication Failed',
    ).then((result) => {
      if (result.ok) {
        showNotification({
          type: NotificationType.success,
          title: 'Deduplication in progress',
          description: 'The deduplication runs in the background',
        });
      }
    });
  }, [selectedChannelId]);

  const fetchIndexStatus = useCallback(() => {
    if (selectedChannelId != null) {
      getChannelIndexStatus(selectedChannelId).then((result) => {
        if (result.ok) {
          setIndexStatus(result.data);
        }
      });
    }
  }, [selectedChannelId]);

  useEffect(() => {
    if (selectedChannelId != null && selectedChannelDataSets.length === 0) {
      updateDataSet();
    }
  }, [selectedChannelId]);

  useEffect(() => {
    fetchIndexStatus();
  }, [selectedChannelId]);

  const recalculateIndexes = (mode: 'sequential' | 'parallel') => {
    setPendingRecalculateMode(null);
    if (mode === 'parallel') {
      if (selectedChannelDataSets.length === 0) return;
      const requests = selectedChannelDataSets.map((ds) =>
        sendPostRequest(
          RELOAD_DATASET_CHANNEL_URL(selectedChannelId as string, ds.id!),
        ),
      );
      withNotification(
        Promise.all(requests).then(
          (results) => results.find((r) => !r.ok) ?? results[0]!,
        ),
        'Recalculate Failed',
      ).then((result) => {
        if (result.ok) {
          showNotification({
            type: NotificationType.success,
            title: 'Recalculation in progress',
            description: 'All indexes are being recalculated in parallel',
          });
          updateDataSet();
        }
      });
    } else {
      withNotification(
        sendPostRequest(
          RELOAD_ALL_DATASETS_CHANNEL_URL(selectedChannelId as string),
        ),
        'Recalculate Failed',
      ).then((result) => {
        if (result.ok) {
          showNotification({
            type: NotificationType.success,
            title: 'Recalculation in progress',
            description: 'Indexes are being recalculated sequentially',
          });
          updateDataSet();
        }
      });
    }
  };

  const addDataSetsIds = useCallback(
    (ids: number[]) => {
      const req$ = ids.map((id) => {
        return sendPostRequest(
          CHANNEL_DATA_SETS_URL(selectedChannelId as string),
          { dsId: id },
        );
      });

      if (req$.length === 0) {
        return;
      }
      Promise.all(req$).then((results) => {
        const firstFailed = results.find((r) => !r.ok);
        if (firstFailed && !firstFailed.ok) {
          showNotification({
            type: NotificationType.error,
            title: 'Add Dataset Failed',
            description: firstFailed.error.message,
          });
        }
        setShowAddDatasetsModal(false);
        updateDataSet();
      });
    },
    [selectedChannelId, showNotification, updateDataSet],
  );

  const deduplication = indexStatus?.vector_store.deduplication;
  const deduplicationRequired = deduplication?.deduplication_required === true;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row items-center justify-between w-full mb-4">
        <h3>Accessible Datasets: {selectedChannelDataSets.length}</h3>
        <div className="flex flex-row items-center">
          <DeduplicationStatsModal deduplication={deduplication} />

          <Button
            title="Export"
            cssClass="secondary mr-3"
            icon={<IconFileArrowRight {...BASE_ICON_PROPS} />}
            onClick={() => exportEntity()}
          />

          <DropdownMenu
            type="contextMenu"
            listClassName="py-1"
            onOpenChange={setIsRecalculateMenuOpen}
            trigger={
              <button
                type="button"
                className="secondary mr-3 flex items-center gap-2"
              >
                <IconRefreshDot {...BASE_ICON_PROPS} />
                Recalculate all indexes
                <ArrowUpIcon
                  width={18}
                  height={18}
                  className={`transition-transform${isRecalculateMenuOpen ? '' : ' rotate-180'}`}
                />
              </button>
            }
          >
            <DropdownMenuItem
              className="small-medium hover:bg-accent-primary-alpha"
              label="Sequential recalculation"
              onClick={() => setPendingRecalculateMode('sequential')}
            />
            <DropdownMenuItem
              className="small-medium hover:bg-accent-primary-alpha"
              label="Parallel recalculation"
              onClick={() => setPendingRecalculateMode('parallel')}
            />
          </DropdownMenu>
          <Button
            title="Add"
            cssClass="primary"
            icon={<IconPlus {...BASE_ICON_PROPS} />}
            onClick={() => setShowAddDatasetsModal(true)}
          />
        </div>
      </div>
      {deduplicationRequired && (
        <DeduplicationAlert onDeduplicate={deduplicate} />
      )}
      <div className="flex-1 min-h-0">
        <GridView
          data={selectedChannelDataSets}
          colDefs={gridColumns}
          emptyDataTitle="No Datasets"
          isLoading={isLoadingChannelDataSets}
        />
      </div>

      {showAddDatasetsModal &&
        createPortal(
          <AddDatasets
            close={() => setShowAddDatasetsModal(false)}
            add={(ids) => addDataSetsIds(ids)}
          />,
          document.body,
        )}

      {configureProps &&
        createPortal(
          <EditDataEntity
            close={() => setConfigureProps(null)}
            entity={configureProps.entity}
            url={configureProps.url}
            showNameInput={configureProps.showNameInput}
            title={configureProps.title}
            onSuccess={updateDataSet}
            renderResults={renderDataSetResults}
          />,
          document.body,
        )}

      <ConfirmDialog
        modalState={
          pendingRecalculateMode != null ? PopUpState.Opened : PopUpState.Closed
        }
        header={`Confirm ${pendingRecalculateMode ?? ''} indexes recalculation`}
        description="Recalculating all indexes may be time-consuming, depending on the selected mode and number of indexes."
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onClose={(confirmed) => {
          if (confirmed) recalculateIndexes(pendingRecalculateMode!);
          setPendingRecalculateMode(null);
        }}
      />
    </div>
  );
};
