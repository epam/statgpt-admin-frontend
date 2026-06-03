import { ReactNode } from 'react';

import { MainShell } from '@/src/components/MainShell/MainShell';
import { ChannelDataProvider } from '@/src/context/ChannelDataContext';

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <MainShell>
      <ChannelDataProvider channelId={id}>{children}</ChannelDataProvider>
    </MainShell>
  );
}
