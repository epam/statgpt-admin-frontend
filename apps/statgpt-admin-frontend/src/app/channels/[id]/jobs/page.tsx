'use client';
import { JobsView } from '@/src/components/JobsView/JobsView';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();

  return <JobsView selectedChannelId={params.id as string} />;
}
