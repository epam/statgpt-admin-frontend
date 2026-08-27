import { IconClock, IconExclamationCircle } from '@tabler/icons-react';

import {
  DISCOVERY_VALIDATION_STATUS_LABEL,
  DiscoveryValidationStatus,
} from '@/src/models/discovery-dataset';
import { CheckIcon } from '@/src/components/GridView/StatusIconCell/CheckIcon';
import { StatusVisual } from '@/src/components/GridView/StatusIconCell/types';

export const DISCOVERY_VALIDATION_STATUS_VISUALS: Record<
  DiscoveryValidationStatus,
  StatusVisual
> = {
  [DiscoveryValidationStatus.NotValidated]: {
    label:
      DISCOVERY_VALIDATION_STATUS_LABEL[DiscoveryValidationStatus.NotValidated],
    icon: IconClock,
    iconColorClass: 'text-icon-secondary',
  },
  [DiscoveryValidationStatus.Valid]: {
    label: DISCOVERY_VALIDATION_STATUS_LABEL[DiscoveryValidationStatus.Valid],
    icon: CheckIcon,
  },
  [DiscoveryValidationStatus.Invalid]: {
    label: DISCOVERY_VALIDATION_STATUS_LABEL[DiscoveryValidationStatus.Invalid],
    icon: IconExclamationCircle,
    iconColorClass: 'text-icon-error',
    textColorClass: 'text-error',
  },
};
