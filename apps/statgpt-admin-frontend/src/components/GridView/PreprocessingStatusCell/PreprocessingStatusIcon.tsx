'use client';

import {
  IconClock,
  IconExclamationCircle,
  IconLoader4,
} from '@tabler/icons-react';

import Check from '@/public/icons/check.svg';
import { PreprocessingStatus } from '@/src/models/preprocessing-status';
import { Tooltip } from '@/src/components/BaseComponents/Tooltip/Tooltip';

interface Props {
  status: PreprocessingStatus;
  failureReason?: string;
}

export const PreprocessingStatusIcon = ({ status, failureReason }: Props) => {
  switch (status) {
    case PreprocessingStatus.COMPLETED:
      return (
        <Check className="[&_path]:fill-[var(--icon-accent-secondary,#37BABC)] size-4 flex-shrink-0 ml-auto" />
      );

    case PreprocessingStatus.FAILED:
      return failureReason ? (
        <Tooltip content={failureReason} className="ml-auto flex-shrink-0">
          <IconExclamationCircle
            size={16}
            className="text-icon-error cursor-help"
          />
        </Tooltip>
      ) : (
        <IconExclamationCircle
          size={16}
          className="text-icon-error flex-shrink-0 ml-auto"
        />
      );

    case PreprocessingStatus.IN_PROGRESS:
      return (
        <IconLoader4
          size={16}
          className="text-icon-accent-primary flex-shrink-0 ml-auto"
        />
      );

    case PreprocessingStatus.QUEUED:
      return (
        <IconClock
          size={16}
          className="text-icon-secondary flex-shrink-0 ml-auto"
        />
      );

    default:
      return null;
  }
};
