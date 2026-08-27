'use client';

import { useEffect } from 'react';

import {
  deduplicateDataset,
  getDeduplicationJob,
} from '@/src/app/channels/actions';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { useJobPolling } from '@/src/hooks/useJobPolling';
import {
  DeduplicationJobStatus,
  type DeduplicationJob,
} from '@/src/models/deduplication-job';
import { Notification, NotificationType } from '@/src/models/notification';

const DEDUPLICATION_JOB_STATUS_TITLE: Record<DeduplicationJobStatus, string> = {
  [DeduplicationJobStatus.NOT_STARTED]: 'Duplicate removal not started',
  [DeduplicationJobStatus.QUEUED]: 'Duplicate removal queued',
  [DeduplicationJobStatus.IN_PROGRESS]: 'Removing duplicates',
  [DeduplicationJobStatus.COMPLETED]: 'Duplicate removal completed',
  [DeduplicationJobStatus.FAILED]: 'Duplicate removal failed',
};

const DEDUPLICATION_JOB_STATUS_DESCRIPTION: Record<
  DeduplicationJobStatus,
  string
> = {
  [DeduplicationJobStatus.NOT_STARTED]:
    'Preparing to remove duplicate records…',
  [DeduplicationJobStatus.QUEUED]:
    'Your request is in the queue and will start shortly.',
  [DeduplicationJobStatus.IN_PROGRESS]:
    'This can take a few minutes — you can keep working in the meantime.',
  [DeduplicationJobStatus.COMPLETED]: 'Duplicate removal completed.',
  [DeduplicationJobStatus.FAILED]: 'Duplicate removal failed.',
};

const getDeduplicationSuccessDescription = (job: DeduplicationJob) =>
  [
    `Non-indicator remapped: ${job.non_indicator_remapped}`,
    `Special remapped: ${job.special_remapped}`,
    `Non-indicator deleted: ${job.non_indicator_deleted}`,
    `Special deleted: ${job.special_deleted}`,
  ].join('\n');

const isDeduplicationJobFinal = (job: DeduplicationJob) =>
  job.status === DeduplicationJobStatus.COMPLETED ||
  job.status === DeduplicationJobStatus.FAILED;

const deduplicationJobStatusKey = (job: DeduplicationJob) => job.status;

const buildDeduplicationStatusNotification = (job: DeduplicationJob) => ({
  title: DEDUPLICATION_JOB_STATUS_TITLE[job.status],
  description: DEDUPLICATION_JOB_STATUS_DESCRIPTION[job.status],
});

const buildDeduplicationFinalNotification = (
  job: DeduplicationJob,
): Notification => {
  if (job.status === DeduplicationJobStatus.FAILED) {
    return {
      type: NotificationType.error,
      title: DEDUPLICATION_JOB_STATUS_TITLE[job.status],
      description:
        job.reason_for_failure?.trim() ||
        'Unable to remove duplicates. Please try again.',
    };
  }

  return {
    type: NotificationType.success,
    title: DEDUPLICATION_JOB_STATUS_TITLE[job.status],
    description: getDeduplicationSuccessDescription(job),
  };
};

interface UseDeduplicationJobPollingParams {
  channelId?: string;
  onFinished: () => void;
}

export const useDeduplicationJobPolling = ({
  channelId,
  onFinished,
}: UseDeduplicationJobPollingParams) => {
  const withNotification = useApiNotification();

  const { isInProgress, operationIdRef, resetState, invalidate, startPolling } =
    useJobPolling<DeduplicationJob>({
      isFinal: isDeduplicationJobFinal,
      statusKey: deduplicationJobStatusKey,
      buildStatusNotification: buildDeduplicationStatusNotification,
      buildFinalNotification: buildDeduplicationFinalNotification,
      pollFn: getDeduplicationJob,
      onFinal: () => onFinished(),
      pollErrorTitle: 'Deduplication status check failed',
      timeoutTitle: 'Deduplication is taking longer than expected',
      timeoutDescription:
        'Duplicate removal is still running in the background. Please check back later.',
    });

  const deduplicate = () => {
    if (channelId == null) {
      return;
    }

    resetState(true);
    const operationId = operationIdRef.current;

    withNotification(
      deduplicateDataset(channelId),
      'Deduplication Failed',
    ).then((result) => {
      if (operationIdRef.current !== operationId) {
        return;
      }

      if (result.ok) {
        startPolling(result.data.id, operationId, result.data);
      } else {
        resetState(false);
      }
    });
  };

  useEffect(() => {
    resetState(false);
    return () => {
      invalidate();
    };
  }, [channelId, resetState, invalidate]);

  return {
    deduplicate,
    isDeduplicationInProgress: isInProgress,
  };
};
