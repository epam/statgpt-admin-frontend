import {
  IconAlertTriangle,
  IconClock,
  IconExclamationCircle,
} from '@tabler/icons-react';

import {
  DISCOVERY_INDEXING_STATUS_LABEL,
  DiscoveryIndexingStatus,
} from '@/src/models/discovery-dataset';
import { CheckIcon } from '@/src/components/GridView/StatusIconCell/CheckIcon';
import { StatusVisual } from '@/src/components/GridView/StatusIconCell/types';

export const DISCOVERY_INDEXING_STATUS_VISUALS: Record<
  DiscoveryIndexingStatus,
  StatusVisual
> = {
  [DiscoveryIndexingStatus.New]: {
    label: DISCOVERY_INDEXING_STATUS_LABEL[DiscoveryIndexingStatus.New],
    icon: IconClock,
    iconColorClass: 'text-icon-secondary',
  },
  [DiscoveryIndexingStatus.Outdated]: {
    label: DISCOVERY_INDEXING_STATUS_LABEL[DiscoveryIndexingStatus.Outdated],
    icon: IconAlertTriangle,
    iconColorClass: 'text-icon-warning',
  },
  [DiscoveryIndexingStatus.Indexed]: {
    label: DISCOVERY_INDEXING_STATUS_LABEL[DiscoveryIndexingStatus.Indexed],
    icon: CheckIcon,
  },
  [DiscoveryIndexingStatus.Failed]: {
    label: DISCOVERY_INDEXING_STATUS_LABEL[DiscoveryIndexingStatus.Failed],
    icon: IconExclamationCircle,
    iconColorClass: 'text-icon-error',
    textColorClass: 'text-error',
  },
};
