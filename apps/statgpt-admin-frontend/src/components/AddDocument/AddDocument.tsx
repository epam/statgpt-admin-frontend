import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import ArrowLeft from '@/public/icons/arrow-left.svg';
import { getMetaData, uploadFile } from '@/src/app/documents/action';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { FieldWithInput } from '@/src/components/BaseComponents/Fields/FieldWithInput';
import LoadFileAreaField from '@/src/components/BaseComponents/LoadFileArea/LoadFileArea';
import { Modal } from '@/src/components/Modal/Modal';
import { Stepper } from '@/src/components/Stepper/Stepper';
import { DocumentMetadata } from '@/src/models/document';
import { Step } from '@/src/models/step';
import { Parameters } from './Parameters/Parameters';
import { BaseStep } from '@/src/constants/steps';

interface Props {
  close: () => void;
}

export const AddDocumentModal: FC<Props> = ({ close }) => {
  const [files, setFiles] = useState<FileList | undefined>(void 0);
  const [targetPath, setTargetPath] = useState<string | undefined>();
  const [metadata, setMetadata] = useState<string>('');
  const [configuration, setConfiguration] = useState<
    DocumentMetadata | undefined | null
  >();
  const [isValid, setIsValid] = useState(false);

  const steps: Step[] = [
    {
      key: BaseStep.Properties,
      isCompleted: () => !!files && targetPath !== '',
    },
    {
      key: BaseStep.Configuration,
      isCompleted: () => metadata !== '',
    },
  ];

  const [activeStep, setActiveStep] = useState(steps[0].key);
  const router = useRouter();

  useEffect(() => {
    getMetaData().then((meta) => {
      setConfiguration(meta);
    });
  }, []);

  const handleFileInput = (files?: FileList): void => {
    setFiles(files);
  };

  const addDocument = (): void => {
    if (files) {
      const formData = new FormData();
      formData.append('attachment', files[0], files[0].name);
      formData.append('metadata', metadata);
      uploadFile(formData, targetPath).then(() => {
        router.refresh();
        close();
      });
    }
  };

  return (
    <Modal title="Add document" close={close} width="55%">
      <Stepper
        activeStep={activeStep}
        steps={steps}
        onChangeActiveStep={(step) => setActiveStep(step)}
      />
      <>
        {activeStep === BaseStep.Properties && (
          <div className="flex flex-col gap-y-6 h-[300px] p-4">
            <FieldWithInput
              title="Target Path"
              inputPlaceholder="A target path of your Document."
              inputValue={targetPath}
              onChange={(value) => setTargetPath(value as string)}
            />

            <LoadFileAreaField
              elementId="file"
              acceptTypes=""
              emptyTitle="Drop file here"
              fieldTitle="File"
              files={files}
              onChangeFile={handleFileInput}
            />
          </div>
        )}

        {activeStep === BaseStep.Configuration && (
          <Parameters
            dimensions={configuration?.dimensions ?? []}
            properties={configuration?.schema?.properties ?? {}}
            onValuesChange={(v) => {
              setMetadata(v);
            }}
            onValidChange={setIsValid}
          />
        )}
      </>

      {
        <div className="flex flex-row justify-end w-full">
          {activeStep === BaseStep.Configuration && (
            <Button
              cssClass="secondary"
              title="Back"
              icon={<ArrowLeft />}
              onClick={() => setActiveStep(BaseStep.Properties)}
            />
          )}

          <div className="flex flex-row justify-end w-full">
            <Button
              cssClass="secondary"
              title="Cancel"
              onClick={() => close()}
            />
            {activeStep === BaseStep.Properties && (
              <Button
                cssClass="primary ml-3"
                title="Next"
                disable={!(!!files && targetPath !== '')}
                onClick={() => setActiveStep(BaseStep.Configuration)}
              />
            )}
            {activeStep === BaseStep.Configuration && (
              <Button
                cssClass="primary ml-3"
                title="Add"
                disable={!isValid}
                onClick={() => addDocument()}
              />
            )}
          </div>
        </div>
      }
    </Modal>
  );
};
