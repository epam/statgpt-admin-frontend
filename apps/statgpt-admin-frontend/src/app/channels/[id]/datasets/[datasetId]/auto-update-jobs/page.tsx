'use client';

import { AutoUpdateJobsView } from '@/src/components/ChannelView/Datasets/AutoUpdateJobsView';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();

  return (
    <AutoUpdateJobsView
      selectedChannelId={params.id as string}
      selectedDatasetId={params.datasetId as string}
    />
  );
}
