import { FC } from 'react';

import ArrowLeft from '@/public/icons/arrow-left.svg';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { BaseStep } from '@/src/constants/steps';

interface Props {
  isValidDataSource: boolean;
  activeStep: string;
  createDataSource: () => void;
  close: () => void;
  setActiveStep: (step: string) => void;
}

export const ModalButtons: FC<Props> = ({
  setActiveStep,
  activeStep,
  isValidDataSource,
  createDataSource,
  close,
}) => {
  return (
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
        <Button cssClass="secondary" title="Cancel" onClick={() => close()} />
        {activeStep === BaseStep.Properties && (
          <Button
            cssClass="primary ml-3"
            title="Next"
            disable={!isValidDataSource}
            onClick={() => setActiveStep(BaseStep.Configuration)}
          />
        )}
        {activeStep === BaseStep.Configuration && (
          <Button
            cssClass="primary ml-3"
            title="Finish"
            onClick={() => createDataSource()}
          />
        )}
      </div>
    </div>
  );
};
