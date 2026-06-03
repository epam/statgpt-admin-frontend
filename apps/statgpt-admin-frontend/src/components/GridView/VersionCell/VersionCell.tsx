'use client';

import { ICellRendererParams } from 'ag-grid-community';

import { ChannelDataset } from '@/src/models/channel-dataset';
import { PreprocessingStatus } from '@/src/models/preprocessing-status';
import { PreprocessingStatusIcon } from '@/src/components/GridView/PreprocessingStatusCell/PreprocessingStatusIcon';
import { mergeClasses } from '@/src/utils/mergeClasses';

interface VersionCellParams extends ICellRendererParams<ChannelDataset> {
  versionField: 'last_completed_version' | 'latest_version';
}

export const VersionCell = ({ data, versionField }: VersionCellParams) => {
  const version = data?.[versionField];
  if (!version) return null;

  const status = version.preprocessing_status;
  const isFailed = status === PreprocessingStatus.FAILED;

  return (
    <div
      className={mergeClasses(
        'flex items-center w-full',
        isFailed && 'text-error',
      )}
    >
      <span>{version.version}</span>
      <PreprocessingStatusIcon
        status={status}
        failureReason={version.reason_for_failure}
      />
    </div>
  );
};
