'use client';

import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { createPortal } from 'react-dom';

import { IconFileArrowLeft, IconPlus } from '@tabler/icons-react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import { Menu } from '@/src/constants/menu';
import { BASE_ICON_PROPS } from '@/src/constants/layout';
import { useNotification } from '@/src/context/NotificationContext';
import { DiscoveryUploadMode } from '@/src/models/discovery-dataset';
import { NotificationType } from '@/src/models/notification';
import { AddEntityModal } from '../AddEntityModal';
import { ImportChannelModal } from './ImportChannelModal';
import { sendPostRequest } from '../../../server/api';
import { useApiNotification } from '@/src/hooks/use-api-notification';

interface Props {
  title: string;
  count: number;
}

export const ListHeader: FC<Props> = ({ title, count }) => {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const router = useRouter();
  const withNotification = useApiNotification();
  const { showNotification, removeNotification } = useNotification();

  const uploadFile = (
    files: FileList,
    updateDatasets: boolean,
    updateDataSources: boolean,
    cleanUp: boolean,
    discoveryDatasetsMode: DiscoveryUploadMode,
    glossaryTermsMode: DiscoveryUploadMode,
  ) => {
    setShowImportModal(false);
    const formData = new FormData();
    formData.append('file', files[0], files[0].name);

    const loadingNotificationId = showNotification({
      type: NotificationType.loading,
      title: 'Importing channel',
      description: 'Import is in progress. This may take a few minutes.',
      duration: null,
    });

    withNotification(
      sendPostRequest(
        `/api/v1/channels/import?updateDatasets=${updateDatasets}&updateDataSources=${updateDataSources}&cleanUp=${cleanUp}&discoveryDatasetsMode=${discoveryDatasetsMode}&glossaryTermsMode=${glossaryTermsMode}`,
        formData,
      ),
      'Import Failed',
    ).then((result) => {
      removeNotification(loadingNotificationId);
      if (result.ok) {
        showNotification({
          type: NotificationType.success,
          title: 'Import complete',
          description: 'Channel imported successfully.',
        });
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-row items-center justify-between">
      <h1>
        {title}: {count}
      </h1>

      <div className="flex flex-row gap-3">
        {title === Menu.CHANNELS && (
          <>
            <Button
              cssClass="secondary"
              title="Import"
              icon={<IconFileArrowLeft {...BASE_ICON_PROPS} />}
              onClick={() => setShowImportModal(true)}
            />
          </>
        )}
        <Button
          cssClass="primary"
          title="Add"
          icon={<IconPlus {...BASE_ICON_PROPS} />}
          onClick={() => setShowModal(true)}
        />
      </div>

      {showModal &&
        createPortal(
          <AddEntityModal close={() => setShowModal(false)} type={title} />,
          document.body,
        )}

      {showImportModal &&
        createPortal(
          <ImportChannelModal
            close={() => setShowImportModal(false)}
            uploadFile={uploadFile}
          />,
          document.body,
        )}
    </div>
  );
};
