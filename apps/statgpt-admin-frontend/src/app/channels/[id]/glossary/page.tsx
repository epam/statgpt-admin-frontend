'use client';
import { TermsView } from '@/src/components/TermsView/TermsView';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();

  return <TermsView selectedChannelId={params.id as string} />;
}
