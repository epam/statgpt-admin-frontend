'use client';

import { useParams } from 'next/navigation';

import { DiscoveryDatasetsView } from '@/src/components/DiscoveryDatasetsView/DiscoveryDatasetsView';
import { useSetBreadcrumbs } from '@/src/context/BreadcrumbContext';
import { useChannelData } from '@/src/context/ChannelDataContext';
import { Menu } from '@/src/constants/menu';
import { ROUTES } from '@/src/constants/routes';

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const { channel } = useChannelData();

  useSetBreadcrumbs([
    { name: Menu.CHANNELS, href: ROUTES.channels },
    { name: channel?.title ?? id, href: ROUTES.channel(id) },
    { name: 'Discovery Datasets' },
  ]);

  return <DiscoveryDatasetsView selectedChannelId={id} />;
}
