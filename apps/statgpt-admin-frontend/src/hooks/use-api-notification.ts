'use client';

import { useRef } from 'react';
import { useNotification } from '@/src/context/NotificationContext';
import { ApiResult } from '@/src/server/api';
import { NotificationType } from '@/src/models/notification';

export function useApiNotification() {
  const { showNotification } = useNotification();

  // Keep a ref to always call the latest showNotification without recreating the
  // returned function on every render (generic functions can't use useCallback).
  const showNotificationRef = useRef(showNotification);
  showNotificationRef.current = showNotification;

  const withNotificationRef = useRef(async function withNotification<R>(
    request: Promise<ApiResult<R>>,
    errorTitle = 'Request failed',
    suppressStatuses: number[] = [],
  ): Promise<ApiResult<R>> {
    const result = await request;
    if (!result.ok && !suppressStatuses.includes(result.error.status)) {
      showNotificationRef.current({
        type: NotificationType.error,
        title: errorTitle,
        description: result.error.message,
      });
    }
    return result;
  });

  return withNotificationRef.current;
}
