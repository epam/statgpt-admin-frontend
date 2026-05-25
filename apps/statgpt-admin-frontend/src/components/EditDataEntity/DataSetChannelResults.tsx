'use client';

import { FC } from 'react';
import { ColDef, ICellRendererParams, ITooltipParams } from 'ag-grid-community';
import { IconExternalLink } from '@tabler/icons-react';

import { ChannelResult, ChannelResultStatus } from '@/src/models/data-sets';
import { AlertBanner } from '@/src/components/BaseComponents/AlertBanner/AlertBanner';
import { GridView } from '@/src/components/GridView/GridView';
import { mergeClasses } from '@/src/utils/mergeClasses';
import { DETAILS_TOOLTIP_KEY } from '@/src/components/GridView/DetailsTooltip/DetailsTooltip';

const TOOLTIP_TEXT: Record<ChannelResultStatus, string> = {
  auto_updated: 'Latest indexed version updated automatically',
  needs_reindex:
    'Configuration is not compatible with the current indexed version',
  indexing_in_progress:
    'Conflict detected: data may be overwritten due to parallel reindexing',
  no_version: 'Update not possible: no successfully indexed versions found',
};

const ChannelNameCell = ({ data }: ICellRendererParams<ChannelResult>) => {
  if (!data) return null;
  return (
    <div className="flex items-center gap-2">
      <span>{data.channel.title}</span>
      <a
        href={`/channels/${data.channel.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-primary flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <IconExternalLink size={16} />
      </a>
    </div>
  );
};

const StateCell = ({ data }: ICellRendererParams<ChannelResult>) => {
  if (!data) return null;
  const updated = data.status === 'auto_updated';
  return (
    <div className="flex items-center gap-2">
      <span
        className={mergeClasses(
          'w-2 h-2 rounded-full flex-shrink-0 inline-block',
          updated ? 'bg-accent-secondary' : 'bg-icon-error',
        )}
      />
      <span>{updated ? 'Updated' : 'Update failed'}</span>
    </div>
  );
};

const COL_DEFS: ColDef[] = [
  {
    headerName: 'Channel Name',
    field: 'channel.title',
    filter: 'agTextColumnFilter',
    cellRenderer: ChannelNameCell,
  },
  {
    headerName: 'State',
    field: 'status',
    filter: 'agTextColumnFilter',
    cellRenderer: StateCell,
    tooltipValueGetter: (params: ITooltipParams<ChannelResult>) => {
      const status = params.data?.status;
      return status ? (TOOLTIP_TEXT[status] ?? '') : '';
    },
    tooltipComponent: DETAILS_TOOLTIP_KEY,
  },
];

interface Props {
  channelResults: ChannelResult[];
}

export const DataSetChannelResults: FC<Props> = ({ channelResults }) => {
  const failedCount = channelResults.filter(
    (r) => r.status !== 'auto_updated',
  ).length;

  return (
    <div className="flex flex-col h-full">
      {failedCount > 0 && (
        <AlertBanner>
          {failedCount} channel dataset{failedCount !== 1 ? 's' : ''} failed to
          update and require reindexing.
        </AlertBanner>
      )}
      <div className="flex-1 min-h-0">
        <GridView
          data={channelResults}
          colDefs={COL_DEFS}
          emptyDataTitle="No channel results"
        />
      </div>
    </div>
  );
};
