'use client';

import { useParams } from 'next/navigation';

import { AutoUpdateJobsView } from '@/src/components/ChannelView/Datasets/AutoUpdateJobsView';
import { useSetBreadcrumbs } from '@/src/context/BreadcrumbContext';
import { useChannelData } from '@/src/context/ChannelDataContext';
import { useDatasetData } from '@/src/context/DatasetDataContext';

export default function Page() {
  const params = useParams();
  const channelId = params.id as string;
  const datasetId = params.datasetId as string;
  const { channel } = useChannelData();
  const { dataset } = useDatasetData();

  useSetBreadcrumbs([
    { name: 'Channels', href: '/channels' },
    { name: channel?.title ?? channelId, href: `/channels/${channelId}` },
    { name: dataset?.dataset.title ?? datasetId },
    { name: 'Auto Update Jobs' },
  ]);

  return (
    <AutoUpdateJobsView
      selectedChannelId={channelId}
      selectedDatasetId={datasetId}
    />
  );
}
