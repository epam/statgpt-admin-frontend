import { FC } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import { BaseStep } from '@/src/constants/steps';
import { IconArrowLeft } from '@tabler/icons-react';
import { BASE_ICON_PROPS } from '@/src/constants/layout';

interface Props {
  close: () => void;
  create: () => void;
  isValidChannel: boolean;
  activeStep: string;
  setActiveStep: (step: string) => void;
}

export const ModalButtons: FC<Props> = ({
  close,
  setActiveStep,
  activeStep,
  isValidChannel,
  create,
}) => {
  return (
    <div className="flex flex-row justify-end w-full">
      {activeStep !== BaseStep.Properties && (
        <Button
          cssClass="secondary"
          title="Back"
          icon={<IconArrowLeft {...BASE_ICON_PROPS} />}
          onClick={() => setActiveStep(BaseStep.Properties)}
        />
      )}

      <div className="flex flex-row justify-end w-full">
        <Button cssClass="secondary" title="Cancel" onClick={() => close()} />

        {activeStep !== BaseStep.Configuration && (
          <Button
            cssClass="primary ml-3"
            title="Next"
            disable={!isValidChannel}
            onClick={() => setActiveStep(BaseStep.Configuration)}
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
