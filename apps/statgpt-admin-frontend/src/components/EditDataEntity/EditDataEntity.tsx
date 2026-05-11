import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { stringify } from 'yaml';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import { MonacoEditor } from '@/src/components/Editor/Editor';
import { Modal } from '@/src/components/Modal/Modal';
import { BaseEntityWithDetails } from '@/src/models/base-entity';
import { sendPostRequest } from '@/src/server/api';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { useYamlParser } from '@/src/hooks/use-yaml-parser';

interface Props {
  close: () => void;
  url: string;
  entity: BaseEntityWithDetails;
}

export const EditDataEntity: FC<Props> = ({ close, entity, url }) => {
  const [config, setConfig] = useState<string>(stringify(entity.details));
  const router = useRouter();
  const withNotification = useApiNotification();
  const parseYaml = useYamlParser();

  const updateEntity = async () => {
    const parsed = parseYaml(config);
    if (!parsed.ok) return;

    const result = await withNotification(
      sendPostRequest(`${url}/${entity.id}`, {
        ...entity,
        details: parsed.value,
      }),
      'Save Failed',
    );
    if (result.ok) {
      router.refresh();
      close();
    }
  };

  return (
    <Modal title="Configuration" close={close} height="80vh">
      <></>
      <div className="h-full common-paddings">
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
