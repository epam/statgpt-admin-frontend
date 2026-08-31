'use client';

import { useEffect } from 'react';

import {
  getDiscoveryIndexingJob,
  getLatestDiscoveryIndexingJob,
  triggerDiscoveryIndexingJob,
} from '@/src/app/channels/actions';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { useJobPolling } from '@/src/hooks/useJobPolling';
import {
  DiscoveryIndexingJobStatus,
  type DiscoveryIndexingJob,
} from '@/src/models/discovery-dataset';
import { Notification, NotificationType } from '@/src/models/notification';

const DISCOVERY_INDEXING_JOB_STATUS_TITLE: Record<
  DiscoveryIndexingJobStatus,
  string
> = {
  [DiscoveryIndexingJobStatus.Queued]: 'Reindexing queued',
  [DiscoveryIndexingJobStatus.InProgress]: 'Reindexing in progress',
  [DiscoveryIndexingJobStatus.Completed]: 'Reindexing completed',
  [DiscoveryIndexingJobStatus.Failed]: 'Reindexing failed',
};

const DISCOVERY_INDEXING_JOB_STATUS_DESCRIPTION: Record<
  DiscoveryIndexingJobStatus,
  string
> = {
  [DiscoveryIndexingJobStatus.Queued]:
    'Your request is in the queue and will start shortly.',
  [DiscoveryIndexingJobStatus.InProgress]:
    'Validating records and publishing to the knowledge base — you can keep working in the meantime.',
  [DiscoveryIndexingJobStatus.Completed]: 'Reindexing completed.',
  [DiscoveryIndexingJobStatus.Failed]: 'Reindexing failed.',
};

const getDiscoveryIndexingSuccessDescription = (job: DiscoveryIndexingJob) =>
  [
    `Records valid: ${job.recordsValid}`,
    `Records invalid: ${job.recordsInvalid}`,
    `Documents upserted: ${job.documentsUpserted}`,
    `Documents deleted: ${job.documentsDeleted}`,
  ].join('\n');

const isDiscoveryIndexingJobFinal = (job: DiscoveryIndexingJob) =>
  job.status === DiscoveryIndexingJobStatus.Completed ||
  job.status === DiscoveryIndexingJobStatus.Failed;

const discoveryIndexingJobStatusKey = (job: DiscoveryIndexingJob) => job.status;

const buildDiscoveryStatusNotification = (job: DiscoveryIndexingJob) => ({
  title: DISCOVERY_INDEXING_JOB_STATUS_TITLE[job.status],
  description: DISCOVERY_INDEXING_JOB_STATUS_DESCRIPTION[job.status],
});

const buildDiscoveryFinalNotification = (
  job: DiscoveryIndexingJob,
): Notification => {
  if (job.status === DiscoveryIndexingJobStatus.Failed) {
    return {
      type: NotificationType.error,
      title: DISCOVERY_INDEXING_JOB_STATUS_TITLE[job.status],
      description:
        job.reasonForFailure?.trim() ||
        'Unable to reindex discovery datasets. Please try again.',
    };
  }

  return {
    type: NotificationType.success,
    title: DISCOVERY_INDEXING_JOB_STATUS_TITLE[job.status],
    description: getDiscoveryIndexingSuccessDescription(job),
  };
};

interface UseDiscoveryIndexingJobPollingParams {
  channelId?: string;
  onCompleted: () => void;
}

export const useDiscoveryIndexingJobPolling = ({
  channelId,
  onCompleted,
}: UseDiscoveryIndexingJobPollingParams) => {
  const withNotification = useApiNotification();

  const { isInProgress, operationIdRef, resetState, invalidate, startPolling } =
    useJobPolling<DiscoveryIndexingJob>({
      isFinal: isDiscoveryIndexingJobFinal,
      statusKey: discoveryIndexingJobStatusKey,
      buildStatusNotification: buildDiscoveryStatusNotification,
      buildFinalNotification: buildDiscoveryFinalNotification,
      pollFn: getDiscoveryIndexingJob,
      onFinal: (job) => {
        if (job.status === DiscoveryIndexingJobStatus.Failed) {
          console.error(
            `Discovery indexing job ${job.id} for channel ${job.channelId} failed: ${job.reasonForFailure}`,
          );
        }
        onCompleted();
      },
      pollErrorTitle: 'Reindex status check failed',
      timeoutTitle: 'Reindexing is taking longer than expected',
      timeoutDescription:
        'Reindexing is still running in the background. Please check back later.',
    });

  const triggerReindex = (force: boolean) => {
    if (channelId == null) {
      return;
    }

    resetState(true);
    const operationId = operationIdRef.current;

    withNotification(
      triggerDiscoveryIndexingJob(channelId, force),
      'Reindex Failed',
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

    if (channelId == null) {
      return;
    }

    const operationId = operationIdRef.current;

    getLatestDiscoveryIndexingJob(channelId).then((result) => {
      if (operationIdRef.current !== operationId || !result.ok) {
        return;
      }

      const [latestJob] = result.data.data;
      if (latestJob && !isDiscoveryIndexingJobFinal(latestJob)) {
        startPolling(latestJob.id, operationId, latestJob);
      }
    });

    return () => {
      invalidate();
    };
  }, [channelId, resetState, invalidate, operationIdRef, startPolling]);

  return {
    triggerReindex,
    isReindexInProgress: isInProgress,
  };
};
