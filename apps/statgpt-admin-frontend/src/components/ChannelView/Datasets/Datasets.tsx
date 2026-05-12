'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { deduplicateDataset, exportChannel } from '@/src/app/channels/actions';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { GridView } from '@/src/components/GridView/GridView';
import { ACTION_COLUMN, EntityOperation } from '@/src/constants/columns/action';
import { Menu } from '@/src/constants/menu';
import { useAccessControl } from '@/src/context/AccessControlContext';
import { useNotification } from '@/src/context/NotificationContext';
import { DataSet } from '@/src/models/data-sets';
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
} from '@/src/server/channels-api';
import { AddDatasets } from '../AddDataSets/AddDataSets';
import { IconCopy, IconDownload, IconRefreshDot } from '@tabler/icons-react';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { DETAILS_TOOLTIP_KEY } from '@/src/components/GridView/DetailsTooltip/DetailsTooltip';

interface Props {
  selectedChannelId?: string;
}

export const DataSetsView: FC<Props> = ({ selectedChannelId }) => {
  const { showNotification, removeNotification } = useNotification();
  const withNotification = useApiNotification();
  const { setForbidden } = useAccessControl();

  const [showModal, setShowModal] = useState(false);
  const [isLoadingChannelDataSets, setIsLoadingChannelDataSets] =
    useState(false);

  const [selectedChannelDataSets, setSelectedChannelDataSets] = useState<
    DataSet[]
  >([]);

  const updateDataSet = useCallback(() => {
    if (selectedChannelId != null && !isLoadingChannelDataSets) {
      setIsLoadingChannelDataSets(true);
      withNotification(
        sendGetRequest<RequestData<DataSet>>(
          CHANNEL_DATA_SETS_URL(selectedChannelId),
        ),
        'Failed to Load Datasets',
        [403],
      ).then((result) => {
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
  }, [selectedChannelId, isLoadingChannelDataSets, withNotification]);

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

  const gridColumns = [
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
      field: 'preprocessing_status',
      headerName: 'Status',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'dataset.status.status',
      headerName: 'Dataset Status',
      filter: 'agTextColumnFilter',
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
      valueFormatter: ({ value }) =>
        value ? new Date(value).toLocaleString() : '',
    },
    {
      field: 'latest_version.preprocessing_status',
      headerName: 'Latest Status',
      filter: 'agTextColumnFilter',
    },
    ACTION_COLUMN(
      Menu.CHANNELS,
      [EntityOperation.RecalculateIndex, EntityOperation.Delete],
      deleteDataSet.bind(this),
    ),
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

  useEffect(() => {
    if (selectedChannelId != null && selectedChannelDataSets.length === 0) {
      updateDataSet();
    }
  }, [selectedChannelId]);

  const recalculateIndexes = () => {
    withNotification(
      sendPostRequest(
        RELOAD_ALL_DATASETS_CHANNEL_URL(selectedChannelId as string),
      ),
      'Recalculate Failed',
    ).then((result) => {
      if (result.ok) {
        updateDataSet();
      }
    });
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
        setShowModal(false);
        updateDataSet();
      });
    },
    [selectedChannelId, showNotification, updateDataSet],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row items-center justify-between w-full mb-4">
        <h3>Accessible Datasets: {selectedChannelDataSets.length}</h3>
        <div className="flex flex-row items-center">
          <Button
            title="Export"
            cssClass="secondary mr-3"
            icon={<IconDownload width={18} height={18} />}
            onClick={() => exportEntity()}
          />

          <Button
            title="Deduplicate"
            cssClass="secondary mr-3"
            icon={<IconCopy width={18} height={18} />}
            onClick={() => deduplicate()}
          />

          <Button
            title="Recalculate all indexes"
            cssClass="secondary mr-3"
            icon={<IconRefreshDot width={18} height={18} />}
            onClick={() => recalculateIndexes()}
          />
          <Button
            title="Add"
            cssClass="primary"
            onClick={() => setShowModal(true)}
          />
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <GridView
          data={selectedChannelDataSets}
          colDefs={gridColumns}
          emptyDataTitle="No Datasets"
        />
      </div>

      {showModal &&
        createPortal(
          <AddDatasets
            close={() => setShowModal(false)}
            add={(ids) => addDataSetsIds(ids)}
          />,
          document.body,
        )}
    </div>
  );
};
