'use client';

import { useParams } from 'next/navigation';

import { DatasetVersions } from '@/src/components/ChannelView/DatasetVersions/DatasetVersions';

export const dynamic = 'force-dynamic';

export default function Page() {
  const params = useParams();

  return (
    <DatasetVersions
      channelId={params.id as string}
      datasetId={params.datasetId as string}
    />
  );
}
