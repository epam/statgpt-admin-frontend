'use client';

import { PreprocessingStatus } from '@/src/models/preprocessing-status';
import { StatusIcon } from '@/src/components/GridView/StatusIconCell/StatusIcon';
import { PREPROCESSING_STATUS_VISUALS } from './preprocessing-status-visuals';

interface Props {
  status: PreprocessingStatus;
  failureReason?: string;
}

export const PreprocessingStatusIcon = ({ status, failureReason }: Props) => {
  const visual = PREPROCESSING_STATUS_VISUALS[status];

  return (
    <StatusIcon
      icon={visual?.icon}
      colorClass={visual?.iconColorClass}
      tooltipContent={failureReason}
    />
  );
};
