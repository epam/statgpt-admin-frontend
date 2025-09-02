import { FC } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import ArrowLeft from '@/public/icons/arrow-left.svg';
import { BaseStep, DatasetStep } from '@/src/constants/steps';

interface Props {
  isValidDataSourceStep: boolean;
  isValidDataSetStep: boolean;
  activeStep: string;
  create: () => void;
  close: () => void;
  setActiveStep: (step: string) => void;
}

export const ModalsButtons: FC<Props> = ({
  setActiveStep,
  activeStep,
  isValidDataSetStep,
  isValidDataSourceStep,
  create,
  close,
}) => {
  return (
    <div className="flex flex-row justify-end w-full">
      {activeStep !== DatasetStep.DataSource && (
        <Button
          cssClass="secondary"
          title="Back"
          icon={<ArrowLeft />}
          onClick={() => setActiveStep(getPreviousStep(activeStep))}
        />
      )}

      <div className="flex flex-row justify-end w-full">
        <Button cssClass="secondary" title="Cancel" onClick={() => close()} />

        {activeStep !== BaseStep.Configuration && (
          <Button
            cssClass="primary ml-3"
            title="Next"
            disable={
              activeStep === DatasetStep.DataSource
                ? isValidDataSourceStep
                : isValidDataSetStep
            }
            onClick={() => setActiveStep(getNextStep(activeStep))}
          />
        )}

        {activeStep === BaseStep.Configuration && (
          <Button
            cssClass="primary ml-3"
            title="Finish"
            onClick={() => create()}
          />
        )}
      </div>
    </div>
  );
};

const getPreviousStep = (activeStep: string) => {
  if (activeStep === DatasetStep.DataSource) {
    return DatasetStep.DataSet;
  }

  return DatasetStep.DataSource;
};

const getNextStep = (activeStep: string) => {
  if (activeStep === DatasetStep.DataSource) {
    return DatasetStep.DataSet;
  }

  return BaseStep.Configuration;
};
