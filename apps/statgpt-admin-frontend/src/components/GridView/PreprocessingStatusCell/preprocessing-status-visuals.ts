import {
  IconClock,
  IconExclamationCircle,
  IconLoader4,
} from '@tabler/icons-react';

import {
  PREPROCESSING_STATUS_LABEL,
  PreprocessingStatus,
} from '@/src/models/preprocessing-status';
import { CheckIcon } from '@/src/components/GridView/StatusIconCell/CheckIcon';
import { StatusVisual } from '@/src/components/GridView/StatusIconCell/types';

export const PREPROCESSING_STATUS_VISUALS: Record<
  PreprocessingStatus,
  StatusVisual
> = {
  [PreprocessingStatus.NOT_STARTED]: {
    label: PREPROCESSING_STATUS_LABEL[PreprocessingStatus.NOT_STARTED],
  },
  [PreprocessingStatus.QUEUED]: {
    label: PREPROCESSING_STATUS_LABEL[PreprocessingStatus.QUEUED],
    icon: IconClock,
    iconColorClass: 'text-icon-secondary',
  },
  [PreprocessingStatus.IN_PROGRESS]: {
    label: PREPROCESSING_STATUS_LABEL[PreprocessingStatus.IN_PROGRESS],
    icon: IconLoader4,
    iconColorClass: 'text-icon-accent-primary',
  },
  [PreprocessingStatus.COMPLETED]: {
    label: PREPROCESSING_STATUS_LABEL[PreprocessingStatus.COMPLETED],
    icon: CheckIcon,
  },
  [PreprocessingStatus.FAILED]: {
    label: PREPROCESSING_STATUS_LABEL[PreprocessingStatus.FAILED],
    icon: IconExclamationCircle,
    iconColorClass: 'text-icon-error',
    textColorClass: 'text-error',
  },
};
