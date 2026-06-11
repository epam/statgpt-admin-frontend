'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  deduplicateDataset,
  getDeduplicationJob,
} from '@/src/app/channels/actions';
import { useNotification } from '@/src/context/NotificationContext';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import {
  DEDUPLICATION_JOB_STATUS_LABEL,
  DeduplicationJobStatus,
  type DeduplicationJob,
} from '@/src/models/deduplication-job';
import { NotificationType } from '@/src/models/notification';

const DEDUPLICATION_JOB_POLL_INTERVAL_MS = 2000;

const getDeduplicationStatusLabel = (status: DeduplicationJobStatus) =>
  DEDUPLICATION_JOB_STATUS_LABEL[status] ?? status;

const DEDUPLICATION_JOB_STATUS_TITLE: Partial<
  Record<DeduplicationJobStatus, string>
> = {
  [DeduplicationJobStatus.NOT_STARTED]: 'Duplicates removal not started',
  [DeduplicationJobStatus.QUEUED]: 'Duplicates removal queued',
  [DeduplicationJobStatus.IN_PROGRESS]: 'Removing duplicates',
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
        title:
          DEDUPLICATION_JOB_STATUS_TITLE[job.status] || 'Removing duplicates',
        description: `Job #${job.id}: ${getDeduplicationStatusLabel(job.status)}`,
        duration: null,
      });
    },
    [replaceNotification],
  );

  const showFinalNotification = useCallback(
    (job: DeduplicationJob) => {
      clearPolling();
      clearNotification();
      lastStatusRef.current = null;
      operationIdRef.current += 1;
      setIsDeduplicationInProgress(false);
      onFinishedRef.current();

      if (job.status === DeduplicationJobStatus.FAILED) {
        showNotificationRef.current({
          type: NotificationType.error,
          title: 'Duplicates removal failed',
          description:
            job.reason_for_failure?.trim() ||
            'Unable to remove duplicates. Please try again.',
        });
        return;
      }

      showNotificationRef.current({
        type: NotificationType.success,
        title: 'Duplicate removal succeeded',
        description: getDeduplicationSuccessDescription(job),
      });
    },
    [clearNotification, clearPolling],
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

      const poll = async () => {
        const result = await getDeduplicationJob(jobId);
        if (operationIdRef.current !== operationId) {
          return;
        }

        if (!result.ok) {
          clearPolling();
          clearNotification();
          lastStatusRef.current = null;
          operationIdRef.current += 1;
          setIsDeduplicationInProgress(false);
          showNotificationRef.current({
            type: NotificationType.error,
            title: 'Deduplication status check failed',
            description:
              result.error.message ||
              'Unable to check deduplication status. Please try again.',
          });
          return;
        }

        if (!handleJob(result.data)) {
          pollingTimeoutRef.current = setTimeout(
            poll,
            DEDUPLICATION_JOB_POLL_INTERVAL_MS,
          );
        }
      };

      pollingTimeoutRef.current = setTimeout(
        poll,
        DEDUPLICATION_JOB_POLL_INTERVAL_MS,
      );
    },
    [clearNotification, clearPolling, handleJob],
  );

  const deduplicate = useCallback(() => {
    if (channelId == null) {
      return;
    }

    const operationId = operationIdRef.current + 1;
    operationIdRef.current = operationId;
    clearPolling();
    clearNotification();
    lastStatusRef.current = null;
    setIsDeduplicationInProgress(true);

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
  }, [
    channelId,
    clearNotification,
    clearPolling,
    handleJob,
    startPolling,
    withNotification,
  ]);

  useEffect(() => {
    operationIdRef.current += 1;
    clearPolling();
    clearNotification();
    lastStatusRef.current = null;
    setIsDeduplicationInProgress(false);
  }, [channelId, clearNotification, clearPolling]);

  useEffect(() => {
    return () => {
      operationIdRef.current += 1;
      clearPolling();
      clearNotification();
      lastStatusRef.current = null;
    };
  }, [clearNotification, clearPolling]);

  return {
    deduplicate,
    isDeduplicationInProgress,
  };
};
