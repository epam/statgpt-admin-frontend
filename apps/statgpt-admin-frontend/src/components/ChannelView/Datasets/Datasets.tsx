'use clients';

import { FC, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { exportChannel } from '@/src/app/channels/actions';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { GridView } from '@/src/components/GridView/GridView';
import { ACTION_COLUMN, EntityOperation } from '@/src/constants/columns/action';
import { Menu } from '@/src/constants/menu';
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
import { IconDownload, IconRefreshDot } from '@tabler/icons-react';

interface Props {
  selectedChannelId?: string;
}

export const DataSetsView: FC<Props> = ({ selectedChannelId }) => {
  const deleteDataSet = (id?: number) => {
    setIsLoadingChannelDataSets(true);
    sendDeleteRequest(
      CHANNEL_DATA_SETS_URL(`${selectedChannelId as string}__${id as number}`),
    ).then(() => {
      updateDataSet();
    });
  };

  const { showNotification, removeNotification } = useNotification();

  const exportEntity = () => {
    const id = showNotification({
      type: NotificationType.loading,
      title: 'Export channel',
      description: 'Preparing export files',
      duration: undefined,
    });
    exportChannel(selectedChannelId || '').then((res) => {
      removeNotification(id);
      if ((res as { ok: boolean }).ok) {
        window.open(`/${(res as { res: string }).res}`, '_blank');
      } else {
        showNotification({
          type: NotificationType.error,
          title: 'Export Failed',
          description: (res as { res: string }).res,
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
    ACTION_COLUMN(
      Menu.CHANNELS,
      [EntityOperation.RecalculateIndex, EntityOperation.Delete],
      deleteDataSet.bind(this),
    ),
  ];

  const [showModal, setShowModal] = useState(false);
  const [isLoadingChannelDataSets, setIsLoadingChannelDataSets] =
    useState(false);

  const [selectedChannelDataSets, setSelectedChannelDataSets] = useState<
    DataSet[]
  >([]);

  const updateDataSet = useCallback(() => {
    if (selectedChannelId != null && !isLoadingChannelDataSets) {
      setIsLoadingChannelDataSets(true);
      sendGetRequest(CHANNEL_DATA_SETS_URL(selectedChannelId)).then((data) => {
        setIsLoadingChannelDataSets(false);
        setSelectedChannelDataSets([...(data as RequestData<DataSet>).data]);
      });
    }
  }, []);

  useEffect(() => {
    if (selectedChannelId != null && selectedChannelDataSets.length === 0) {
      updateDataSet();
    }
  }, [selectedChannelId]);

  const recalculateIndexes = () => {
    sendPostRequest(
      RELOAD_ALL_DATASETS_CHANNEL_URL(selectedChannelId as string),
    ).then(() => {
      updateDataSet();
    });
  };

  const addDataSetsIds = useCallback((ids: number[]) => {
    const req$ = ids.map((id) => {
      return sendPostRequest(
        CHANNEL_DATA_SETS_URL(selectedChannelId as string),
        { dsId: id },
      );
    });

    if (req$.length === 0) {
      return;
    }
    Promise.all(req$).then(() => {
      setShowModal(false);
      updateDataSet();
    });
  }, []);

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
