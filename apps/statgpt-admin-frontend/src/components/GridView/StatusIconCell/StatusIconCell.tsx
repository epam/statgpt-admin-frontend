'use client';

import { ICellRendererParams } from 'ag-grid-community';

import { mergeClasses } from '@/src/utils/mergeClasses';
import { StatusIcon } from './StatusIcon';
import { StatusVisual } from './types';

interface Props<TData> extends ICellRendererParams<TData> {
  config: Record<string, StatusVisual>;
  tooltip?: (data: TData | undefined) => string | undefined;
}

export const StatusIconCell = <TData,>({
  value,
  data,
  config,
  tooltip,
}: Props<TData>) => {
  if (value == null || value === '') return null;

  const visual = config[String(value)];
  const label = visual?.label ?? String(value);

  return (
    <div
      className={mergeClasses(
        'flex items-center w-full',
        visual?.textColorClass,
      )}
    >
      <span>{label}</span>
      <StatusIcon
        icon={visual?.icon}
        colorClass={visual?.iconColorClass}
        tooltipContent={tooltip?.(data)}
      />
    </div>
  );
};
