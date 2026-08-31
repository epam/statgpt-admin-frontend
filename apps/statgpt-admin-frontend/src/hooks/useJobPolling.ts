'use client';

import { useCallback, useRef, useState } from 'react';

import { useNotification } from '@/src/context/NotificationContext';
import { Notification, NotificationType } from '@/src/models/notification';
import { ApiResult } from '@/src/server/api';

export interface UseJobPollingParams<TJob> {
  /** Whether the job has reached a terminal (completed/failed) state. */
  isFinal: (job: TJob) => boolean;
  /** Value used to avoid replacing the loading toast when polling returns the same status. */
  statusKey: (job: TJob) => string | number;
  /** Loading toast shown while the job is still running. */
  buildStatusNotification: (
    job: TJob,
  ) => Pick<Notification, 'title' | 'description'>;
  /** Toast shown once the job reaches a terminal state. */
  buildFinalNotification: (job: TJob) => Notification;
  /** Fetches the current state of a job by id, for polling. */
  pollFn: (jobId: number) => Promise<ApiResult<TJob>>;
  /** Called once, right before the final toast is shown, for both success and failure. */
  onFinal: (job: TJob) => void;
  pollErrorTitle: string;
  timeoutTitle: string;
  timeoutDescription: string;
  intervalMs?: number;
  timeoutMs?: number;
}

/**
 * Polls a background job until it reaches a terminal state, showing a persistent loading
 * toast that is replaced by a success/error toast on completion. Shared by every "trigger a
 * job, then poll it" flow (deduplication, discovery datasets reindexing, ...) so the
 * polling/notification bookkeeping - timers, stale-response guarding, toast lifecycle - lives
 * in one place.
 */
export function useJobPolling<TJob>({
  isFinal,
  statusKey,
  buildStatusNotification,
  buildFinalNotification,
  pollFn,
  onFinal,
  pollErrorTitle,
  timeoutTitle,
  timeoutDescription,
  intervalMs = 5000,
  timeoutMs = 5 * 60 * 1000,
}: UseJobPollingParams<TJob>) {
  const { showNotification, removeNotification } = useNotification();

  const [isInProgress, setIsInProgress] = useState(false);

  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingStartedAtRef = useRef<number | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const lastStatusKeyRef = useRef<string | number | null>(null);
  const operationIdRef = useRef(0);
  const showNotificationRef = useRef(showNotification);
  const removeNotificationRef = useRef(removeNotification);
  const onFinalRef = useRef(onFinal);

  showNotificationRef.current = showNotification;
  removeNotificationRef.current = removeNotification;
  onFinalRef.current = onFinal;

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
    (notification: Notification) => {
      clearNotification();
      notificationIdRef.current = showNotificationRef.current(notification);
    },
    [clearNotification],
  );

  const invalidate = useCallback(() => {
    clearPolling();
    clearNotification();
    lastStatusKeyRef.current = null;
    operationIdRef.current += 1;
  }, [clearNotification, clearPolling]);

  const resetState = useCallback(
    (inProgress: boolean) => {
      invalidate();
      setIsInProgress(inProgress);
    },
    [invalidate],
  );

  const showStatusNotification = useCallback(
    (job: TJob) => {
      const key = statusKey(job);
      if (
        notificationIdRef.current != null &&
        lastStatusKeyRef.current === key
      ) {
        return;
      }

      lastStatusKeyRef.current = key;
      replaceNotification({
        type: NotificationType.loading,
        ...buildStatusNotification(job),
        duration: null,
        onClose: () => {
          notificationIdRef.current = null;
          lastStatusKeyRef.current = null;
        },
      });
    },
    [replaceNotification, statusKey, buildStatusNotification],
  );

  const showFinal = useCallback(
    (job: TJob) => {
      resetState(false);
      onFinalRef.current(job);
      showNotificationRef.current(buildFinalNotification(job));
    },
    [resetState, buildFinalNotification],
  );

  const handleJob = useCallback(
    (job: TJob) => {
      if (isFinal(job)) {
        showFinal(job);
        return true;
      }

      showStatusNotification(job);
      return false;
    },
    [isFinal, showFinal, showStatusNotification],
  );

  const startPolling = useCallback(
    (jobId: number, operationId: number, initialJob?: TJob) => {
      setIsInProgress(true);

      if (initialJob && handleJob(initialJob)) {
        return;
      }

      clearPolling();
      pollingStartedAtRef.current = Date.now();

      const poll = async () => {
        const result = await pollFn(jobId);
        if (operationIdRef.current !== operationId) {
          return;
        }

        if (!result.ok) {
          resetState(false);
          showNotificationRef.current({
            type: NotificationType.error,
            title: pollErrorTitle,
            description:
              result.error.message ||
              'Unable to check job status. Please try again.',
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
        if (elapsed >= timeoutMs) {
          resetState(false);
          showNotificationRef.current({
            type: NotificationType.error,
            title: timeoutTitle,
            description: timeoutDescription,
          });
          return;
        }

        pollingTimeoutRef.current = setTimeout(poll, intervalMs);
      };

      pollingTimeoutRef.current = setTimeout(poll, intervalMs);
    },
    [
      clearPolling,
      handleJob,
      resetState,
      pollFn,
      pollErrorTitle,
      timeoutTitle,
      timeoutDescription,
      timeoutMs,
      intervalMs,
    ],
  );

  return {
    isInProgress,
    operationIdRef,
    resetState,
    invalidate,
    startPolling,
  };
}
