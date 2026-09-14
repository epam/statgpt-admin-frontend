import { FC, useCallback, useState } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import LoadFileAreaField from '@/src/components/BaseComponents/LoadFileArea/LoadFileArea';
import Switch from '@/src/components/BaseComponents/Switch/Switch';
import { Modal } from '@/src/components/Modal/Modal';
import { useFeatureFlags } from '@/src/context/FeatureFlagsContext';
import { DiscoveryUploadMode } from '@/src/models/discovery-dataset';

interface Props {
  close: () => void;
  uploadFile: (
    files: FileList,
    updateDatasets: boolean,
    updateDataSources: boolean,
    cleanUp: boolean,
    discoveryDatasetsMode: DiscoveryUploadMode,
    glossaryTermsMode: DiscoveryUploadMode,
  ) => void;
}

type Step = 'select' | 'confirm';

export const ImportChannelModal: FC<Props> = ({ close, uploadFile }) => {
  const { discoveryDatasets } = useFeatureFlags();
  const [step, setStep] = useState<Step>('select');
  const [updateDatasets, setIsUpdateDatasets] = useState(false);
  const [updateDataSources, setIsUpdateDataSources] = useState(false);
  const [cleanUp, setCleanUp] = useState(false);
  const [replaceDiscoveryDatasets, setReplaceDiscoveryDatasets] =
    useState(false);
  const [replaceGlossaryTerms, setReplaceGlossaryTerms] = useState(false);
  const [files, setFiles] = useState<FileList | undefined>(void 0);

  const importChannel = (): void => {
    uploadFile?.(
      files as FileList,
      updateDatasets,
      updateDataSources,
      cleanUp,
      replaceDiscoveryDatasets
        ? DiscoveryUploadMode.Replace
        : DiscoveryUploadMode.Upsert,
      replaceGlossaryTerms
        ? DiscoveryUploadMode.Replace
        : DiscoveryUploadMode.Upsert,
    );
  };

  const onImportClick = (): void => {
    if (replaceDiscoveryDatasets || replaceGlossaryTerms) {
      setStep('confirm');
    } else {
      importChannel();
    }
  };

  const handleFileInput = (files?: FileList): void => {
    setFiles(files);
  };

  const onSwitchDataSource = useCallback(
    (value: boolean) => {
      setIsUpdateDataSources(value);
    },
    [setIsUpdateDataSources],
  );

  const onSwitchDataSet = useCallback(
    (value: boolean) => {
      setIsUpdateDatasets(value);
    },
    [setIsUpdateDatasets],
  );

  const onSwitchCleanUp = useCallback(
    (value: boolean) => {
      setCleanUp(value);
    },
    [setCleanUp],
  );

  const onSwitchReplaceDiscoveryDatasets = useCallback(
    (value: boolean) => {
      setReplaceDiscoveryDatasets(value);
    },
    [setReplaceDiscoveryDatasets],
  );

  const onSwitchReplaceGlossaryTerms = useCallback(
    (value: boolean) => {
      setReplaceGlossaryTerms(value);
    },
    [setReplaceGlossaryTerms],
  );

  if (step === 'confirm') {
    return (
      <Modal title="Import Channel" close={close}>
        <></>

        <div className="flex flex-col gap-y-4 h-[400px] p-4">
          <p className="text-primary">
            This will permanently delete records not present in the imported
            archive:
          </p>
          <ul className="list-disc pl-5 text-secondary">
            {replaceDiscoveryDatasets && (
              <li>Grade C datasets not in this archive</li>
            )}
            {replaceGlossaryTerms && (
              <li>Glossary terms not in this archive</li>
            )}
          </ul>
        </div>

        <div className="flex flex-row justify-end">
          <Button
            cssClass="secondary mr-3"
            title="Back"
            onClick={() => setStep('select')}
          />
          <Button
            cssClass="primary"
            title="Confirm Import"
            disable={files == null}
            onClick={() => importChannel()}
          />
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Import Channel" close={close}>
      <></>

      <div className="flex flex-col gap-y-6 h-[400px] p-4">
        <LoadFileAreaField
          elementId="file"
          acceptTypes=""
          emptyTitle="Drop file here"
          fieldTitle="File"
          files={files}
          onChangeFile={handleFileInput}
        />
        <Switch
          isOn={cleanUp}
          title={'Remove channel with the same id'}
          switchId="cleanUp"
          onChange={onSwitchCleanUp}
        />

        <Switch
          isOn={updateDatasets}
          title={'Update data sets'}
          switchId="updateDataSets"
          onChange={onSwitchDataSet}
        />

        <Switch
          isOn={updateDataSources}
          title={'Update data sources'}
          switchId="updateDataSources"
          onChange={onSwitchDataSource}
        />

        {discoveryDatasets && (
          <Switch
            isOn={replaceDiscoveryDatasets}
            title={'Replace Grade C datasets'}
            switchId="replaceDiscoveryDatasets"
            onChange={onSwitchReplaceDiscoveryDatasets}
          />
        )}

        <Switch
          isOn={replaceGlossaryTerms}
          title={'Replace glossary terms'}
          switchId="replaceGlossaryTerms"
          onChange={onSwitchReplaceGlossaryTerms}
        />
      </div>

      <div className="flex flex-row justify-end">
        <Button
          cssClass="secondary mr-3"
          title="Cancel"
          onClick={() => close()}
        />
        <Button
          cssClass="primary"
          title="Import"
          disable={files == null}
          onClick={() => onImportClick()}
        />
      </div>
    </Modal>
  );
};
