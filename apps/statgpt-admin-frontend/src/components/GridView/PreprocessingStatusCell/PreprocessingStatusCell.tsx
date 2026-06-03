'use client';

import { ICellRendererParams } from 'ag-grid-community';
import { IconExclamationCircle } from '@tabler/icons-react';

import Check from '@/public/icons/check.svg';
import {
  PREPROCESSING_STATUS_LABEL,
  PreprocessingStatus,
} from '@/src/models/preprocessing-status';
import { Tooltip } from '@/src/components/BaseComponents/Tooltip/Tooltip';
import { mergeClasses } from '@/src/utils/mergeClasses';

interface WithFailureReason {
  reason_for_failure: string;
}

export const PreprocessingStatusCell = ({
  value,
  data,
}: ICellRendererParams<WithFailureReason>) => {
  if (value == null || value === '') return null;

  const label =
    PREPROCESSING_STATUS_LABEL[value as PreprocessingStatus] ?? String(value);
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
