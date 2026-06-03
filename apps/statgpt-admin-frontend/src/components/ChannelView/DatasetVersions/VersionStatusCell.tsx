'use client';

import { ICellRendererParams } from 'ag-grid-community';
import { IconExclamationCircle } from '@tabler/icons-react';

import Check from '@/public/icons/check.svg';
import {
  ChannelDatasetVersion,
  PreprocessingStatus,
} from '@/src/models/channel-dataset-version';
import { mergeClasses } from '@/src/utils/mergeClasses';
import { Tooltip } from '@/src/components/BaseComponents/Tooltip/Tooltip';

const STATUS_LABEL: Record<PreprocessingStatus, string> = {
  [PreprocessingStatus.NOT_STARTED]: 'Not started',
  [PreprocessingStatus.QUEUED]: 'Queued',
  [PreprocessingStatus.IN_PROGRESS]: 'In progress',
  [PreprocessingStatus.COMPLETED]: 'Completed',
  [PreprocessingStatus.FAILED]: 'Failed',
};

export const VersionStatusCell = ({
  value,
  data,
}: ICellRendererParams<ChannelDatasetVersion>) => {
  if (value == null || value === '') return null;

  const label = STATUS_LABEL[value as PreprocessingStatus] ?? String(value);
  const isCompleted = value === PreprocessingStatus.COMPLETED;
  const isFailed = value === PreprocessingStatus.FAILED;
  const failureReason = data?.reason_for_failure;

  return (
    <div
      className={mergeClasses(
        'flex items-center w-full',
        isFailed && 'text-error',
      )}
    >
      <span>{label}</span>
      {isCompleted && (
        <Check className="[&_path]:fill-[var(--icon-accent-secondary,#37BABC)] size-4 flex-shrink-0 ml-auto" />
      )}
      {isFailed && failureReason && (
        <Tooltip content={failureReason} className="ml-auto flex-shrink-0">
          <IconExclamationCircle
            size={16}
            className="text-icon-error cursor-help"
          />
        </Tooltip>
      )}
    </div>
  );
};
