'use client';

import { ICellRendererParams } from 'ag-grid-community';

import { mergeClasses } from '@/src/utils/mergeClasses';

const STATUS_DOT_COLOR: Record<string, string> = {
  online: 'bg-accent-secondary',
  offline: 'bg-icon-error',
  invalid_config: 'bg-yellow-800',
};

const toSentenceCase = (value: string) => {
  const normalized = value.replace(/_/g, ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const StatusCell = ({ value }: ICellRendererParams) => {
  if (value == null || value === '') return null;
  const key = String(value).toLowerCase();
  const dotColor = STATUS_DOT_COLOR[key];

  return (
    <div className="flex items-center gap-2">
      {dotColor && (
        <span
          className={mergeClasses(
            'w-2 h-2 rounded-full flex-shrink-0 inline-block',
            dotColor,
          )}
        />
      )}
      <span>{toSentenceCase(String(value))}</span>
    </div>
  );
};
