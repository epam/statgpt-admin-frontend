'use client';

import { FC, useMemo } from 'react';

import { DiscoveryIndicator } from '@/src/models/discovery-dataset';

interface Props {
  label: string;
  indicators?: DiscoveryIndicator[] | null;
  emptyText?: string;
}

/**
 * Read-only table of a dataset's indicators with their units. Indicators
 * without units are flagged, since those make the record invalid. The table
 * scrolls inside a fixed height so a long list does not push the rest of the
 * details down.
 * @param label - field label
 * @param indicators - indicators to show
 * @param emptyText - shown instead of the table when there are no indicators
 */
export const IndicatorsTable: FC<Props> = ({
  label,
  indicators,
  emptyText = '',
}) => {
  const items = useMemo(() => indicators ?? [], [indicators]);

  const missingUnitsCount = useMemo(
    () => items.filter((item) => !item.units.trim()).length,
    [items],
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className="tiny text-secondary">{label}</span>
        <span className="body text-primary">{emptyText}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row flex-wrap items-baseline gap-x-2">
        <span className="tiny text-secondary">{`${label} (${items.length})`}</span>
        {missingUnitsCount > 0 && (
          <span className="tiny text-error">
            {missingUnitsCount} without units
          </span>
        )}
      </div>

      <div className="max-h-[300px] overflow-auto rounded border border-primary">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-layer-3">
            <tr className="border-b border-primary text-left text-secondary">
              <th className="px-3 py-2 font-normal">Indicator</th>
              <th className="px-3 py-2 font-normal">Units</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-primary last:border-0">
                <td className="px-3 py-1 text-primary">{item.name}</td>
                <td className="px-3 py-1">
                  {item.units.trim() ? (
                    <span className="text-primary">{item.units}</span>
                  ) : (
                    <span className="text-error">Units missing</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
