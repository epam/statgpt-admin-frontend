'use client';

import { useCallback } from 'react';
import { Button } from '../BaseComponents/Button/Button';
import { useNotification } from '@/src/context/NotificationContext';
import { NotificationType } from '@/src/models/notification';
import { downloadFromApiRoute } from '@/src/utils/client/download';
import { TimePeriodDropdown } from './TimePeriodDropdown';
import { useAuditLogFiltersInUrl } from '@/src/hooks/use-audit-logs-filters-in-url';

export const AuditLogsHeader = ({ onRefresh }: { onRefresh: () => void }) => {
  const { showNotification, removeNotification } = useNotification();
  const { filters, setFilters } = useAuditLogFiltersInUrl();

  const exportHandler = useCallback(() => {
    const id = showNotification({
      type: NotificationType.loading,
      title: 'Export audit logs',
      description: 'Preparing export files',
      duration: undefined,
    });

    const query = new URLSearchParams();
    if (filters.created_at_from)
      query.set('created_at_from', filters.created_at_from);
    if (filters.created_at_to)
      query.set('created_at_to', filters.created_at_to);

    const url = `/api/v1/audit-logs/export${query.toString() ? `?${query}` : ''}`;

    downloadFromApiRoute(url)
      .then(() => {
        removeNotification(id);
        showNotification({
          type: NotificationType.success,
          title: 'Export ready',
          description: 'Download started',
        });
      })
      .catch((e) => {
        removeNotification(id);
        showNotification({
          type: NotificationType.error,
          title: 'Export Failed',
          description: e?.message ?? 'Unknown error',
        });
      });
  }, [removeNotification, showNotification, filters]);

  return (
    <div className="flex flex-row items-center justify-between">
      <h1>Audit</h1>

      <div className="flex flex-row gap-4 items-center">
        <TimePeriodDropdown
          value={filters}
          onChange={(range) => setFilters(range)}
        />
        <div className="h-6 border-l border-l-primary" />
        <Button cssClass="secondary" title="Refresh" onClick={onRefresh} />
        <Button cssClass="primary" title="Export" onClick={exportHandler} />
      </div>
    </div>
  );
};
