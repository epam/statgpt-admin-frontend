'use client';

import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { createPortal } from 'react-dom';

import { importChannel } from '@/src/app/channels/actions';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { Menu } from '@/src/constants/menu';
import { useNotification } from '@/src/context/NotificationContext';
import { NotificationType } from '@/src/models/notification';
import { AddEntityModal } from '../AddEntityModal';
import { ImportChannelModal } from './ImportChannelModal';

interface Props {
  title: string;
  count: number;
}

export const ListHeader: FC<Props> = ({ title, count }) => {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const router = useRouter();

  const { showNotification } = useNotification();

  const uploadFile = (
    files: FileList,
    updateDatasets: boolean,
    updateDataSources: boolean,
    cleanUp: boolean,
  ) => {
    setShowImportModal(false);
    const formData = new FormData();
    formData.append('file', files[0], files[0].name);

    importChannel(formData, updateDatasets, updateDataSources, cleanUp).then(
      (res) => {
        if (res.ok) {
          router.refresh();
        } else {
          showNotification({
            type: NotificationType.error,
            title: 'Import Failed',
            description: (res as { res: string }).res,
          });
        }
      },
    );
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
              cssClass="primary"
              title="Import"
              onClick={() => setShowImportModal(true)}
            />
          </>
        )}
        <Button
          cssClass="primary"
          title="Add"
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
