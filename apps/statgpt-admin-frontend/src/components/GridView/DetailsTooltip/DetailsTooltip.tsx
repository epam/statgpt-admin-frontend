'use client';

import { ITooltipParams } from 'ag-grid-community';

export const DETAILS_TOOLTIP_KEY = 'detailsTooltip';

interface DetailsTooltipParams {
  label?: string;
}

export const DetailsTooltip = ({
  value,
  label,
}: ITooltipParams & DetailsTooltipParams) => {
  if (value == null || String(value).trim() === '') return null;

  return (
    <div className="rounded border border-primary bg-layer-2 px-3 py-2 text-xs text-primary shadow-lg max-w-xs break-words">
      {label && (
        <div className="mb-1 font-semibold text-secondary">{label}</div>
      )}
      {String(value)}
    </div>
  );
};
