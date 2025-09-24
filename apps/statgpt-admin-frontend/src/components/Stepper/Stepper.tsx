import { FC } from 'react';

import { Step } from '@/src/models/step';
import { StepItem } from './StepItem/StepItem';

interface Props {
  activeStep: string;
  steps: Step[];
  onChangeActiveStep: (step: string) => void;
}

export const Stepper: FC<Props> = ({
  activeStep,
  steps,
  onChangeActiveStep,
}) => {
  const onClick = (step: Step) => {
    if (activeStep === step.key) {
      return;
    }

    const activeStepDeclaration = steps.find((s) => s.key === activeStep);
    if (
      activeStepDeclaration?.isCompleted != null &&
      !activeStepDeclaration?.isCompleted()
    ) {
      return;
    }

    onChangeActiveStep(step.key);
  };

  return (
    <div className="flex flex-row w-full mt-4">
      {steps.map((step, i) => {
        return (
          <StepItem
            step={step}
            index={i}
            key={i}
            isActive={activeStep === step.key}
            onClick={() => onClick(step)}
          />
        );
      })}
    </div>
  );
};
