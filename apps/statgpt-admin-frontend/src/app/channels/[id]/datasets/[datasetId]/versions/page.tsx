'use client';

import { useParams } from 'next/navigation';

import { DatasetVersions } from '@/src/components/ChannelView/DatasetVersions/DatasetVersions';
import { useSetBreadcrumbs } from '@/src/context/BreadcrumbContext';
import { useChannelData } from '@/src/context/ChannelDataContext';
import { useDatasetData } from '@/src/context/DatasetDataContext';

export const dynamic = 'force-dynamic';

export default function Page() {
  const params = useParams();
  const channelId = params.id as string;
  const datasetId = params.datasetId as string;
  const { channel } = useChannelData();
  const { dataset } = useDatasetData();

  useSetBreadcrumbs([
    { name: 'Channels', href: '/channels' },
    { name: channel?.title ?? channelId, href: `/channels/${channelId}` },
    {
      name: dataset?.dataset.title ?? datasetId,
      href: `/channels/${channelId}/datasets/${datasetId}/versions`,
    },
    { name: 'Versions' },
  ]);

  return <DatasetVersions channelId={channelId} datasetId={datasetId} />;
}
