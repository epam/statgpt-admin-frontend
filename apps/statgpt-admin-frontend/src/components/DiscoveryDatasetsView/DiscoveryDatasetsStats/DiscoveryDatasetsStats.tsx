'use client';

import { FC } from 'react';

import { DISCOVERY_VALIDATION_STATUS_VISUALS } from '@/src/components/GridView/ValidationStatusCell/discovery-validation-status-visuals';
import { DISCOVERY_INDEXING_STATUS_VISUALS } from '@/src/components/GridView/IndexingStatusCell/discovery-indexing-status-visuals';
import { mergeClasses } from '@/src/utils/mergeClasses';
import { DiscoveryDatasetStats } from '@/src/models/discovery-dataset';

interface Props {
  stats: DiscoveryDatasetStats | null;
  isLoading: boolean;
}

const StatItem: FC<{ label: string; count: number; colorClass?: string }> = ({
  label,
  count,
  colorClass,
}) => (
  <span className={mergeClasses('text-secondary', colorClass)}>
    {label}: {count}
  </span>
);

export const DiscoveryDatasetsStats: FC<Props> = ({ stats, isLoading }) => {
  if (isLoading || !stats) return null;

  return (
    <div className="flex flex-row items-center flex-wrap gap-x-4 mb-3 text-sm">
      <StatItem label="Total" count={stats.total} />
      {(
        Object.entries(stats.byValidationStatus) as [
          keyof typeof stats.byValidationStatus,
          number,
        ][]
      ).map(([status, count]) => {
        const visual = DISCOVERY_VALIDATION_STATUS_VISUALS[status];
        return (
          <StatItem
            key={status}
            label={visual.label}
            count={count}
            colorClass={visual.textColorClass}
          />
        );
      })}
      {(
        Object.entries(stats.byIndexingStatus) as [
          keyof typeof stats.byIndexingStatus,
          number,
        ][]
      ).map(([status, count]) => {
        const visual = DISCOVERY_INDEXING_STATUS_VISUALS[status];
        return (
          <StatItem
            key={status}
            label={visual.label}
            count={count}
            colorClass={visual.textColorClass}
          />
        );
      })}
    </div>
  );
};
