import { FC } from 'react';

import Check from '@/public/icons/check.svg';
import { Step } from '@/src/models/step';
import styles from '../stepper.module.scss';

interface Props {
  step: Step;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export const StepItem: FC<Props> = ({ step, index, isActive, onClick }) => {
  return (
    <div
      className={`${styles.step} ${getCssStepClass(step, isActive)}`}
      onClick={() => onClick()}
    >
      <div className={styles.step__line}></div>
      <div className={styles.step__content}>
        <div className={styles.step__circle}>
          {step.isCompleted != null && step.isCompleted?.() ? (
            <Check />
          ) : (
            index + 1
          )}
        </div>
        <div>{step.key}</div>
      </div>
    </div>
  );
};

const getCssStepClass = (step: Step, isActive: boolean): string => {
  if (step.isCompleted != null && step.isCompleted?.()) {
    return styles.step_completed;
  }
  if (isActive) {
    return styles.step_active;
  }

  return '';
};
