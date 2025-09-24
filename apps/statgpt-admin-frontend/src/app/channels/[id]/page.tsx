'use client';

import { ChannelView } from '@/src/components/ChannelView/ChannelView';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();

  return <ChannelView selectedChannelId={params.id as string} />;
}
