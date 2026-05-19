import { useRouter } from 'next/navigation';
import { FC, ReactNode, useState } from 'react';
import { stringify } from 'yaml';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import { MonacoEditor } from '@/src/components/Editor/Editor';
import { Modal } from '@/src/components/Modal/Modal';
import { DatasetConfigForm } from '@/src/components/DatasetConfigForm/DatasetConfigForm';
import { BaseEntityWithDetails } from '@/src/models/base-entity';
import { sendPostRequest } from '@/src/server/api';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { useYamlParser } from '@/src/hooks/use-yaml-parser';

interface Props {
  close: () => void;
  url: string;
  entity: BaseEntityWithDetails;
  onSuccess?: () => void;
  title?: string;
  showNameInput?: boolean;
  renderResults?: (data: unknown) => ReactNode | null;
}

export const EditDataEntity: FC<Props> = ({
  close,
  entity,
  url,
  onSuccess,
  title = 'Configuration',
  showNameInput = false,
  renderResults,
}) => {
  const [config, setConfig] = useState<string>(stringify(entity.details));
  const [resultsContent, setResultsContent] = useState<ReactNode | null>(null);
  const [name, setName] = useState<string>(entity.title ?? '');
  const [nameTouched, setNameTouched] = useState(false);
  const router = useRouter();
  const withNotification = useApiNotification();
  const parseYaml = useYamlParser();

  const isNameInvalid = showNameInput && name.trim() === '';

  const updateEntity = async () => {
    if (isNameInvalid) {
      setNameTouched(true);
      return;
    }

    const parsed = parseYaml(config);
    if (!parsed.ok) return;

    const result = await withNotification(
      sendPostRequest(`${url}/${entity.id}`, {
        ...entity,
        ...(showNameInput ? { title: name.trim() } : {}),
        details: parsed.value,
      }),
      'Save Failed',
    );
    if (result.ok) {
      if (renderResults) {
        const content = renderResults(result.data);
        if (content) {
          setResultsContent(content);
          return;
        }
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }

      close();
    }
  };

  const closeResults = () => {
    close();
    if (onSuccess) {
      setTimeout(onSuccess, 0);
    } else {
      router.refresh();
    }
  };

  if (resultsContent) {
    return (
      <Modal title="Configuration Updated" close={closeResults} height="80vh">
        <></>
        <div className="h-full common-paddings overflow-y-auto">
          {resultsContent}
        </div>
        <div className="flex flex-row justify-end w-full">
          <Button cssClass="primary" title="Close" onClick={closeResults} />
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={title} close={close} height="80vh">
      <></>
      <div className="h-full common-paddings">
        {showNameInput ? (
          <DatasetConfigForm
            name={name}
            nameTouched={nameTouched}
            onNameChange={(value) => {
              setName(value);
              setNameTouched(true);
            }}
            config={config}
            onConfigChange={setConfig}
          />
        ) : (
          <MonacoEditor
            value={config}
            onChange={(value) => setConfig(value || '')}
            language="yaml"
          />
        )}
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
