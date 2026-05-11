import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { parse, stringify } from 'yaml';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import { MonacoEditor } from '@/src/components/Editor/Editor';
import { Modal } from '@/src/components/Modal/Modal';
import { BaseEntityWithDetails } from '@/src/models/base-entity';
import { sendPostRequest } from '@/src/server/api';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { useNotification } from '@/src/context/NotificationContext';
import { NotificationType } from '@/src/models/notification';

interface Props {
  close: () => void;
  url: string;
  entity: BaseEntityWithDetails;
}

export const EditDataEntity: FC<Props> = ({ close, entity, url }) => {
  const [config, setConfig] = useState<string>(stringify(entity.details));
  const router = useRouter();
  const withNotification = useApiNotification();
  const { showNotification } = useNotification();

  const updateEntity = async () => {
    let parsedDetails: unknown;
    try {
      parsedDetails = parse(config);
    } catch (e) {
      showNotification({
        type: NotificationType.error,
        title: 'Invalid Configuration',
        description:
          e instanceof Error
            ? e.message
            : 'YAML syntax error in configuration.',
      });
      return;
    }

    const result = await withNotification(
      sendPostRequest(`${url}/${entity.id}`, {
        ...entity,
        details: parsedDetails,
      }),
      'Save Failed',
    );
    if (result.ok) {
      router.refresh();
      close();
    }
  };

  return (
    <Modal title="Configuration" close={close}>
      <></>
      <div className="h-[600px] common-paddings">
        <MonacoEditor
          value={config}
          onChange={(value) => setConfig(value || '')}
          language="yaml"
        />
      </div>
      <div className="flex flex-row justify-end w-full">
        <Button cssClass="secondary" title="Cancel" onClick={() => close()} />
        <Button
          cssClass="primary ml-3"
          title="Save"
          onClick={() => updateEntity()}
        />
      </div>
    </Modal>
  );
};
