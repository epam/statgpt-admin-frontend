'use client';

import { IconFileArrowRight, IconRefresh } from '@tabler/icons-react';
import { Button } from '../BaseComponents/Button/Button';
import { TimePeriodDropdown } from './TimePeriodDropdown';
import { useAuditLogFiltersInUrl } from '@/src/hooks/use-audit-logs-filters-in-url';
import { BASE_ICON_PROPS } from '@/src/constants/layout';

export const AuditLogsHeader = ({
  count,
  onRefresh,
  onExport,
}: {
  count?: number;
  onRefresh: () => void;
  onExport: () => void;
}) => {
  const { filters, setFilters } = useAuditLogFiltersInUrl();

  return (
    <div className="flex flex-row items-center justify-between">
      <h1>Audit: {count}</h1>

      <div className="flex flex-row gap-4 items-center">
        <TimePeriodDropdown
          value={filters}
          onChange={(range) => setFilters(range)}
        />
        <div className="h-6 border-l border-l-primary" />
        <Button
          cssClass="secondary"
          title="Refresh"
          icon={<IconRefresh {...BASE_ICON_PROPS} />}
          onClick={onRefresh}
        />
        <Button
          cssClass="primary"
          title="Export"
          icon={<IconFileArrowRight {...BASE_ICON_PROPS} />}
          onClick={onExport}
        />
      </div>
    </div>
  );
};
