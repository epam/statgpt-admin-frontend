'use client';

import { useCallback } from 'react';
import { Button } from '../BaseComponents/Button/Button';
import { TimePeriodDropdown } from './TimePeriodDropdown';
import { useAuditLogFiltersInUrl } from '@/src/hooks/use-audit-logs-filters-in-url';

export const AuditLogsHeader = ({
  count,
  onRefresh,
}: {
  count?: number;
  onRefresh: () => void;
}) => {
  const { filters, setFilters } = useAuditLogFiltersInUrl();

  const exportHandler = useCallback(() => {
    const query = new URLSearchParams();
    if (filters.created_at_from)
      query.set('created_at_from', filters.created_at_from);
    if (filters.created_at_to)
      query.set('created_at_to', filters.created_at_to);

    const url = `/api/v1/audit-logs/export${query.toString() ? `?${query}` : ''}`;
    window.open(url, '_blank');
  }, [filters]);

  return (
    <div className="flex flex-row items-center justify-between">
      <h1>Audit: {count}</h1>

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
