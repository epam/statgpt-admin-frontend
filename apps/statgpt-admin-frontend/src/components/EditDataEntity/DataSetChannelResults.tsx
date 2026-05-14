import { FC } from 'react';

import { ChannelResult, ChannelResultStatus } from '@/src/models/data-sets';
import { mergeClasses } from '@/src/utils/mergeClasses';

interface StatusConfig {
  label: string;
  message: string;
  textClass: string;
  bgClass: string;
}

const STATUS_CONFIG: Record<ChannelResultStatus, StatusConfig> = {
  auto_updated: {
    label: 'Auto Updated',
    message: 'Automatically updated. No further action needed.',
    textClass: 'text-accent-secondary',
    bgClass: 'bg-accent-secondary-alpha',
  },
  needs_reindex: {
    label: 'Needs Reindex',
    message:
      'Requires reindexing. Click "Recalculate indexes" on the dataset page to apply the changes.',
    textClass: 'text-accent-tertiary',
    bgClass: 'bg-accent-tertiary-alpha',
  },
  no_version: {
    label: 'No Version',
    message: 'No versions yet — this channel dataset has never been indexed.',
    textClass: 'text-secondary',
    bgClass: 'bg-layer-4',
  },
  indexing_in_progress: {
    label: 'Indexing in Progress',
    message:
      'Currently indexing — configuration changes could not be applied at this time.',
    textClass: 'text-accent-primary',
    bgClass: 'bg-accent-primary-alpha',
  },
};

const FALLBACK_CONFIG: StatusConfig = {
  label: '',
  message: '',
  textClass: 'text-secondary',
  bgClass: 'bg-layer-4',
};

interface Props {
  channelResults: ChannelResult[];
}

export const DataSetChannelResults: FC<Props> = ({ channelResults }) => {
  return (
    <div className="flex flex-col gap-2">
      {channelResults.map((result) => {
        const cfg = STATUS_CONFIG[result.status] ?? {
          ...FALLBACK_CONFIG,
          label: result.status,
        };
        return (
          <div
            key={result.channel_dataset_id}
            className="flex flex-col gap-1 rounded p-3 bg-layer-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-primary font-medium">
                {result.channel.title}
              </span>
              <span
                className={mergeClasses(
                  'text-xs px-2 py-0.5 rounded',
                  cfg.textClass,
                  cfg.bgClass,
                )}
              >
                {cfg.label}
              </span>
            </div>
            {cfg.message && (
              <span className="text-secondary text-sm">{cfg.message}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
