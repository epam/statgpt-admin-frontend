'use client';

import { useParams } from 'next/navigation';

import { ChannelView } from '@/src/components/ChannelView/ChannelView';
import { useSetBreadcrumbs } from '@/src/context/BreadcrumbContext';
import { useChannelData } from '@/src/context/ChannelDataContext';

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const { channel } = useChannelData();

  useSetBreadcrumbs([
    { name: 'Channels', href: '/channels' },
    { name: channel?.title ?? id },
  ]);

  return <ChannelView selectedChannelId={id} />;
}
