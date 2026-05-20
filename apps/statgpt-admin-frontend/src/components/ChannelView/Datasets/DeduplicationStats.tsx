'use client';

import { FC } from 'react';

import { ChannelIndexStatusDeduplication } from '@/src/models/channel-index-status';

interface Props {
  deduplication: ChannelIndexStatusDeduplication;
}

export const DeduplicationStats: FC<Props> = ({ deduplication }) => {
  return (
    <div className="text-sm p-3 bg-layer-4 rounded-sm">
      <div className="flex justify-between py-1 mb-4 font-semibold text-primary">
        <span>Total</span>
        <span>{deduplication.total_duplicate_count}</span>
      </div>
      <div className="flex justify-between pb-2 text-secondary">
        <span>Non-indicator dimensions</span>
        <span>{deduplication.non_indicator_dimensions_duplicate_count}</span>
      </div>
      <div className="flex justify-between pb-2 text-secondary">
        <span>Special dimensions</span>
        <span>{deduplication.special_dimensions_duplicate_count}</span>
      </div>
      <div className="flex justify-between text-secondary">
        <span>Indicator dimensions</span>
        <span>{deduplication.indicator_dimensions_duplicate_count}</span>
      </div>
    </div>
  );
};
