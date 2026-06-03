'use client';

import { useParams } from 'next/navigation';

import { AutoUpdateJobsView } from '@/src/components/ChannelView/Datasets/AutoUpdateJobsView';
import { useSetBreadcrumbs } from '@/src/context/BreadcrumbContext';
import { useChannelData } from '@/src/context/ChannelDataContext';
import { useDatasetData } from '@/src/context/DatasetDataContext';
import { Menu } from '@/src/constants/menu';
import { ROUTES } from '@/src/constants/routes';

export default function Page() {
  const params = useParams();
  const channelId = params.id as string;
  const datasetId = params.datasetId as string;
  const { channel } = useChannelData();
  const { dataset } = useDatasetData();

  useSetBreadcrumbs([
    { name: Menu.CHANNELS, href: ROUTES.channels },
    { name: channel?.title ?? channelId, href: ROUTES.channel(channelId) },
    { name: dataset?.dataset.title ?? datasetId },
    { name: 'Version checks' },
  ]);

  return (
    <AutoUpdateJobsView
      selectedChannelId={channelId}
      selectedDatasetId={datasetId}
    />
  );
}
