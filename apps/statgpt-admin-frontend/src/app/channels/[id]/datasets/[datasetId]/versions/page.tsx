'use client';

import { useParams } from 'next/navigation';

import { DatasetVersions } from '@/src/components/ChannelView/DatasetVersions/DatasetVersions';
import { useSetBreadcrumbs } from '@/src/context/BreadcrumbContext';
import { useChannelData } from '@/src/context/ChannelDataContext';
import { useDatasetData } from '@/src/context/DatasetDataContext';
import { Menu } from '@/src/constants/menu';
import { ROUTES } from '@/src/constants/routes';

export const dynamic = 'force-dynamic';

export default function Page() {
  const params = useParams();
  const channelId = params.id as string;
  const datasetId = params.datasetId as string;
  const { channel } = useChannelData();
  const { dataset } = useDatasetData();

  useSetBreadcrumbs([
    { name: Menu.CHANNELS, href: ROUTES.channels },
    { name: channel?.title ?? channelId, href: ROUTES.channel(channelId) },
    {
      name: dataset?.dataset.title ?? datasetId,
      href: ROUTES.datasetVersions(channelId, datasetId),
    },
    { name: 'Versions' },
  ]);

  return <DatasetVersions channelId={channelId} datasetId={datasetId} />;
}
