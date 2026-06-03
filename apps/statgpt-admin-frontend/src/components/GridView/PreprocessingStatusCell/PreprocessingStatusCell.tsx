'use client';

import { ICellRendererParams } from 'ag-grid-community';

import {
  PREPROCESSING_STATUS_LABEL,
  PreprocessingStatus,
} from '@/src/models/preprocessing-status';
import { PreprocessingStatusIcon } from './PreprocessingStatusIcon';
import { mergeClasses } from '@/src/utils/mergeClasses';

interface WithFailureReason {
  reason_for_failure: string;
}

export const PreprocessingStatusCell = ({
  value,
  data,
}: ICellRendererParams<WithFailureReason>) => {
  if (value == null || value === '') return null;

  const status = value as PreprocessingStatus;
  const label = PREPROCESSING_STATUS_LABEL[status] ?? String(value);
  const isFailed = status === PreprocessingStatus.FAILED;

  return (
    <div
      className={mergeClasses(
        'flex items-center w-full',
        isFailed && 'text-error',
      )}
    >
      <span>{label}</span>
      <PreprocessingStatusIcon
        status={status}
        failureReason={data?.reason_for_failure}
      />
    </div>
  );
};
