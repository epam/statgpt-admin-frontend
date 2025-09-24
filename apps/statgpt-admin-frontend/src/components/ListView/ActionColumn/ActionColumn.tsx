import { IconDots } from '@tabler/icons-react';
import { CustomCellRendererProps } from 'ag-grid-react';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { createPortal } from 'react-dom';

import { exportChannel, removeChannel } from '@/src/app/channels/actions';
import { removeDocument } from '@/src/app/documents/action';
import {
  Menu as DropdownMenu,
  MenuItem as DropdownMenuItem,
} from '@/src/components/BaseComponents/Dropdown/DropdownMenu';
import { DeleteConfirmationModal } from '@/src/components/DeleteConfirmationModal/DeleteConfirmationModal';
import { EditDataEntity } from '@/src/components/EditDataEntity/EditDataEntity';
import { ActionItem } from '@/src/components/GridView/ActionColumn/ActionItem';
import { EntityOperation } from '@/src/constants/columns/action';
import { BASE_ICON_PROPS } from '@/src/constants/layout';
import { Menu } from '@/src/constants/menu';
import { BaseEntity, BaseEntityWithDetails } from '@/src/models/base-entity';
import { DataSet } from '@/src/models/data-sets';
import { sendDeleteRequest, sendPostRequest } from '@/src/server/api';
import { CHANNEL_DATA_SETS_URL } from '@/src/server/channels-api';
import { RELOAD_DIMENSIONS_DATA_SETS_WITH_ID_URL } from '@/src/server/data-sets-api';
import { getDeleteDescription, getDeleteTitle, getUrl } from './utils';
import { useNotification } from '@/src/context/NotificationContext';
import { NotificationType } from '../../../models/notification';

interface Props extends CustomCellRendererProps {
  items: EntityOperation[];
  listView: Menu;
  deleteEntity?: (id?: number) => void;
}

export const ActionColumn: FC<Props> = ({
  items,
  listView,
  data,
  deleteEntity,
  node,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [, setIsOpen] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const { showNotification, removeNotification } = useNotification();
  const confirmDelete = () => {
    if (listView === Menu.DOCUMENTS) {
      removeDocument(data.id).then(() => {
        router.refresh();
      });
      return;
    }

    if (deleteEntity != null) {
      deleteEntity(data.dataset_id);
      return;
    }

    if (listView === Menu.CHANNELS) {
      removeChannel(data.id).then(() => {
        router.refresh();
      });
      return;
    }

    sendDeleteRequest(
      `${getUrl(listView)}/${data.id || data.deployment_id}`,
    ).then(() => {
      router.refresh();
    });
  };

  const exportEntity = () => {
    const id = showNotification({
      type: NotificationType.loading,
      title: 'Export channel',
      description: 'Preparing export files',
      duration: undefined,
    });
    if (listView === Menu.CHANNELS) {
      exportChannel(data.id || data.deployment_id).then((res) => {
        removeNotification(id);
        if ((res as { ok: boolean }).ok) {
          window.open((res as { res: string }).res, '_blank');
        } else {
          showNotification({
            type: NotificationType.error,
            title: 'Export Failed',
            description: (res as { res: string }).res,
          });
        }
      });
    }
  };

  const recalculateDataSet = () => {
    if (listView === Menu.DATA_SETS) {
      sendPostRequest(
        RELOAD_DIMENSIONS_DATA_SETS_WITH_ID_URL(data.id),
        {},
      ).then(() => {
        // add alert
        close();
      });
    }

    if (listView === Menu.CHANNELS) {
      const channelId = pathname.split('/')[2];
      sendPostRequest(CHANNEL_DATA_SETS_URL(channelId), {
        dsId: data.dataset_id,
        isReload: true,
      }).then((ds) => {
        const status = (ds as DataSet).preprocessing_status;
        node.updateData({
          ...node.data,
          preprocessing_status: status,
        } as unknown as BaseEntity);
        // add alert
        close();
      });
    }
  };

  return (
    <>
      <DropdownMenu
        className="flex items-center justify-center w-full relative"
        onOpenChange={setIsOpen}
        width={200}
        type="contextMenu"
        trigger={<IconDots {...BASE_ICON_PROPS} widths={16} height={16} />}
      >
        {items.map((item, i) => (
          <DropdownMenuItem
            key={i}
            className="hover:bg-accent-primary-alpha"
            item={<ActionItem item={item} />}
            onClick={() => {
              if (item === EntityOperation.Delete) {
                setIsOpenDeleteModal(true);
              }

              if (item === EntityOperation.Export) {
                exportEntity();
              }

              if (item === EntityOperation.Configure) {
                setIsOpenEditModal(true);
              }

              if (item === EntityOperation.RecalculateIndex) {
                recalculateDataSet();
              }

              if (item === EntityOperation.Terms) {
                router.push(`/channels/${data.id}/glossary`);
              }

              if (item === EntityOperation.Jobs) {
                router.push(`/channels/${data.id}/jobs`);
              }
            }}
          />
        ))}
      </DropdownMenu>
      {isOpenEditModal &&
        createPortal(
          <EditDataEntity
            close={() => setIsOpenEditModal(false)}
            entity={data as BaseEntityWithDetails}
            url={getUrl(listView)}
          />,
          document.body,
        )}

      {isOpenDeleteModal &&
        createPortal(
          <DeleteConfirmationModal
            close={() => setIsOpenDeleteModal(false)}
            confirm={() => confirmDelete()}
            title={getDeleteTitle(listView)}
            description={getDeleteDescription(listView)}
          />,
          document.body,
        )}
    </>
  );
};
