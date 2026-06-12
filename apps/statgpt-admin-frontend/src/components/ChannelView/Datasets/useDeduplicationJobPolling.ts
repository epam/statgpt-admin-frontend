'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  deduplicateDataset,
  getDeduplicationJob,
} from '@/src/app/channels/actions';
import { useNotification } from '@/src/context/NotificationContext';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import {
  DeduplicationJobStatus,
  type DeduplicationJob,
} from '@/src/models/deduplication-job';
import { NotificationType } from '@/src/models/notification';

const DEDUPLICATION_JOB_POLL_INTERVAL_MS = 5000;
const DEDUPLICATION_JOB_POLL_TIMEOUT_MS = 5 * 60 * 1000;

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

interface UseDeduplicationJobPollingParams {
  channelId?: string;
  onFinished: () => void;
}

export const useDeduplicationJobPolling = ({
  channelId,
  onFinished,
}: UseDeduplicationJobPollingParams) => {
  const { showNotification, removeNotification } = useNotification();
  const withNotification = useApiNotification();

  const [isDeduplicationInProgress, setIsDeduplicationInProgress] =
    useState(false);

  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingStartedAtRef = useRef<number | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const lastStatusRef = useRef<DeduplicationJobStatus | null>(null);
  const operationIdRef = useRef(0);
  const showNotificationRef = useRef(showNotification);
  const removeNotificationRef = useRef(removeNotification);
  const onFinishedRef = useRef(onFinished);

  showNotificationRef.current = showNotification;
  removeNotificationRef.current = removeNotification;
  onFinishedRef.current = onFinished;

  const clearPolling = useCallback(() => {
    if (pollingTimeoutRef.current != null) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  const clearNotification = useCallback(() => {
    if (notificationIdRef.current != null) {
      removeNotificationRef.current(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  }, []);

  const replaceNotification = useCallback(
    (notification: Parameters<typeof showNotification>[0]) => {
      clearNotification();
      notificationIdRef.current = showNotificationRef.current(notification);
    },
    [clearNotification],
  );

  const resetState = useCallback(
    (inProgress: boolean) => {
      clearPolling();
      clearNotification();
      lastStatusRef.current = null;
      operationIdRef.current += 1;
      setIsDeduplicationInProgress(inProgress);
    },
    [clearNotification, clearPolling],
  );

  const showStatusNotification = useCallback(
    (job: DeduplicationJob) => {
      if (
        notificationIdRef.current != null &&
        lastStatusRef.current === job.status
      ) {
        return;
      }

      lastStatusRef.current = job.status;
      replaceNotification({
        type: NotificationType.loading,
        title: DEDUPLICATION_JOB_STATUS_TITLE[job.status],
        description: DEDUPLICATION_JOB_STATUS_DESCRIPTION[job.status],
        duration: null,
        onClose: () => {
          notificationIdRef.current = null;
          lastStatusRef.current = null;
        },
      });
    },
    [replaceNotification],
  );

  const showFinalNotification = useCallback(
    (job: DeduplicationJob) => {
      resetState(false);
      onFinishedRef.current();

      if (job.status === DeduplicationJobStatus.FAILED) {
        showNotificationRef.current({
          type: NotificationType.error,
          title: DEDUPLICATION_JOB_STATUS_TITLE[job.status],
          description:
            job.reason_for_failure?.trim() ||
            'Unable to remove duplicates. Please try again.',
        });
        return;
      }

      showNotificationRef.current({
        type: NotificationType.success,
        title: DEDUPLICATION_JOB_STATUS_TITLE[job.status],
        description: getDeduplicationSuccessDescription(job),
      });
    },
    [resetState],
  );

  const handleJob = useCallback(
    (job: DeduplicationJob) => {
      if (
        job.status === DeduplicationJobStatus.COMPLETED ||
        job.status === DeduplicationJobStatus.FAILED
      ) {
        showFinalNotification(job);
        return true;
      }

      showStatusNotification(job);
      return false;
    },
    [showFinalNotification, showStatusNotification],
  );

  const startPolling = useCallback(
    (jobId: number, operationId: number) => {
      clearPolling();
      pollingStartedAtRef.current = Date.now();

      const poll = async () => {
        const result = await getDeduplicationJob(jobId);
        if (operationIdRef.current !== operationId) {
          return;
        }

        if (!result.ok) {
          resetState(false);
          showNotificationRef.current({
            type: NotificationType.error,
            title: 'Deduplication status check failed',
            description:
              result.error.message ||
              'Unable to check deduplication status. Please try again.',
          });
          return;
        }

        if (handleJob(result.data)) {
          return;
        }

        const elapsed =
          pollingStartedAtRef.current != null
            ? Date.now() - pollingStartedAtRef.current
            : 0;
        if (elapsed >= DEDUPLICATION_JOB_POLL_TIMEOUT_MS) {
          resetState(false);
          showNotificationRef.current({
            type: NotificationType.error,
            title: 'Deduplication is taking longer than expected',
            description:
              'Duplicate removal is still running in the background. Please check back later.',
          });
          return;
        }

        pollingTimeoutRef.current = setTimeout(
          poll,
          DEDUPLICATION_JOB_POLL_INTERVAL_MS,
        );
      };

      pollingTimeoutRef.current = setTimeout(
        poll,
        DEDUPLICATION_JOB_POLL_INTERVAL_MS,
      );
    },
    [clearPolling, handleJob, resetState],
  );

  const deduplicate = useCallback(() => {
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
        if (!handleJob(result.data)) {
          startPolling(result.data.id, operationId);
        }
      } else {
        setIsDeduplicationInProgress(false);
      }
    });
  }, [channelId, resetState, handleJob, startPolling, withNotification]);

  useEffect(() => {
    resetState(false);
    return () => {
      clearPolling();
      clearNotification();
      lastStatusRef.current = null;
      operationIdRef.current += 1;
    };
  }, [channelId, resetState, clearPolling, clearNotification]);

  return {
    deduplicate,
    isDeduplicationInProgress,
  };
};
