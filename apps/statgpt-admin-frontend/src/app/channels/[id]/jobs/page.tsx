'use client';

import { useParams } from 'next/navigation';

import { JobsView } from '@/src/components/JobsView/JobsView';
import { useSetBreadcrumbs } from '@/src/context/BreadcrumbContext';
import { useChannelData } from '@/src/context/ChannelDataContext';

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const { channel } = useChannelData();

  useSetBreadcrumbs([
    { name: 'Channels', href: '/channels' },
    { name: channel?.title ?? id, href: `/channels/${id}` },
    { name: 'Jobs' },
  ]);

  return <JobsView selectedChannelId={id} />;
}
