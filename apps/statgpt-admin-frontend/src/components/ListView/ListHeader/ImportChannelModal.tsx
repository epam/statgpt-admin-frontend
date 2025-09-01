import { FC, useCallback, useState } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import LoadFileAreaField from '@/src/components/BaseComponents/LoadFileArea/LoadFileArea';
import Switch from '@/src/components/BaseComponents/Switch/Switch';
import { Modal } from '@/src/components/Modal/Modal';

interface Props {
  close: () => void;
  uploadFile: (
    files: FileList,
    updateDatasets: boolean,
    updateDataSources: boolean,
    cleanUp: boolean,
  ) => void;
}

export const ImportChannelModal: FC<Props> = ({ close, uploadFile }) => {
  const [updateDatasets, setIsUpdateDatasets] = useState(false);
  const [updateDataSources, setIsUpdateDataSources] = useState(false);
  const [cleanUp, setCleanUp] = useState(false);
  const [files, setFiles] = useState<FileList | undefined>(void 0);

  const importChannel = (): void => {
    uploadFile?.(files as FileList, updateDatasets, updateDataSources, cleanUp);
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

  return (
    <Modal title="Import Channel" close={close}>
      <></>

      <div className="flex flex-col gap-y-6 h-[300px] p-4">
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
          onClick={() => importChannel()}
        />
      </div>
    </Modal>
  );
};
