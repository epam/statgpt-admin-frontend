'use client';

import { FC } from 'react';

import { IconInfoCircle } from '@tabler/icons-react';

import { ChannelIndexStatusDeduplication } from '@/src/models/channel-index-status';

interface Props {
  deduplication: ChannelIndexStatusDeduplication;
}

export const DeduplicationStats: FC<Props> = ({ deduplication }) => {
  return (
    <div className="relative group ml-1">
      <button
        type="button"
        className="flex items-center justify-center w-8 h-8 rounded border border-primary bg-transparent text-secondary hover:bg-layer-4"
      >
        <IconInfoCircle width={16} height={16} />
      </button>
      <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 rounded border border-primary bg-layer-2 px-3 py-2 text-xs text-primary shadow-lg z-10">
        <div className="font-semibold text-secondary mb-2">
          Duplicate counts
        </div>
        <div className="flex justify-between py-0.5">
          <span className="text-secondary">Total</span>
          <span>{deduplication.total_duplicate_count}</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span className="text-secondary">Non-indicator dimensions</span>
          <span>{deduplication.non_indicator_dimensions_duplicate_count}</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span className="text-secondary">Special dimensions</span>
          <span>{deduplication.special_dimensions_duplicate_count}</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span className="text-secondary">Indicator dimensions</span>
          <span>{deduplication.indicator_dimensions_duplicate_count}</span>
        </div>
      </div>
    </div>
  );
};
