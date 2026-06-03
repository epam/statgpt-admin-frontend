'use client';

import { ICellRendererParams } from 'ag-grid-community';

import {
  AUTO_UPDATE_RESULT_LABEL,
  AutoUpdateResult,
} from '@/src/models/auto-update-job';
import { ChannelDataset } from '@/src/models/channel-dataset';
import {
  PREPROCESSING_STATUS_LABEL,
  PreprocessingStatus,
} from '@/src/models/preprocessing-status';
import { PreprocessingStatusIcon } from '@/src/components/GridView/PreprocessingStatusCell/PreprocessingStatusIcon';
import { Tooltip } from '@/src/components/BaseComponents/Tooltip/Tooltip';
import { mergeClasses } from '@/src/utils/mergeClasses';

export const LastVersionCheckCell = ({
  data,
}: ICellRendererParams<ChannelDataset>) => {
  const job = data?.last_auto_update_job;
  if (!job) return null;

  const status = job.status;
  const isFailed = status === PreprocessingStatus.FAILED;

  const date = job.updated_at ? new Date(job.updated_at).toLocaleString() : '';

  const statusLabel = PREPROCESSING_STATUS_LABEL[status] ?? status;
  const resultLabel =
    job.result != null
      ? (AUTO_UPDATE_RESULT_LABEL[job.result as AutoUpdateResult] ?? job.result)
      : null;

  const tooltipHeader = [statusLabel, resultLabel].filter(Boolean).join('. ');
  const tooltipDetail = job.details || job.reason_for_failure;

  const tooltipContent = (
    <>
      <div className="font-semibold">{tooltipHeader}</div>
      {tooltipDetail && <div className="mt-2">{tooltipDetail}</div>}
    </>
  );

  return (
    <Tooltip content={tooltipContent} className="w-full">
      <div
        className={mergeClasses(
          'flex items-center w-full',
          isFailed && 'text-error',
        )}
      >
        <span>{date}</span>
        <PreprocessingStatusIcon status={status} />
      </div>
    </Tooltip>
  );
};
