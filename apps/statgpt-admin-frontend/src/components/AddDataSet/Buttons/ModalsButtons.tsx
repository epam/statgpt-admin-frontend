import { FC } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import { BaseStep, DatasetStep } from '@/src/constants/steps';
import { IconArrowLeft } from '@tabler/icons-react';
import { BASE_ICON_PROPS } from '@/src/constants/layout';

interface Props {
  isValidDataSourceStep: boolean;
  isValidProviderStep: boolean;
  isValidDataSetStep: boolean;
  activeStep: string;
  create: () => void;
  close: () => void;
  setActiveStep: (step: string) => void;
}

export const ModalsButtons: FC<Props> = ({
  setActiveStep,
  activeStep,
  isValidDataSourceStep,
  isValidProviderStep,
  isValidDataSetStep,
  create,
  close,
}) => {
  return (
    <div className="flex flex-row justify-end w-full">
      {activeStep !== DatasetStep.DataSource && (
        <Button
          cssClass="secondary"
          title="Back"
          icon={<IconArrowLeft {...BASE_ICON_PROPS} />}
          onClick={() => setActiveStep(getPreviousStep(activeStep))}
        />
      )}

      <div className="flex flex-row justify-end w-full">
        <Button cssClass="secondary" title="Cancel" onClick={() => close()} />

        {activeStep !== BaseStep.Configuration && (
          <Button
            cssClass="primary ml-3"
            title="Next"
            disable={getIsNextDisabled(
              activeStep,
              isValidDataSourceStep,
              isValidProviderStep,
              isValidDataSetStep,
            )}
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
  if (activeStep === DatasetStep.Provider) return DatasetStep.DataSource;
  if (activeStep === DatasetStep.DataSet) return DatasetStep.Provider;
  return DatasetStep.DataSet;
};

const getNextStep = (activeStep: string) => {
  if (activeStep === DatasetStep.DataSource) return DatasetStep.Provider;
  if (activeStep === DatasetStep.Provider) return DatasetStep.DataSet;
  return BaseStep.Configuration;
};

const getIsNextDisabled = (
  activeStep: string,
  isValidDataSourceStep: boolean,
  isValidProviderStep: boolean,
  isValidDataSetStep: boolean,
) => {
  if (activeStep === DatasetStep.DataSource) return isValidDataSourceStep;
  if (activeStep === DatasetStep.Provider) return isValidProviderStep;
  return isValidDataSetStep;
};
