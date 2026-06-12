import { ReactNode } from 'react';

import { MainShell } from '@/src/components/MainShell/MainShell';
import { ChannelDataProvider } from '@/src/context/ChannelDataContext';
import { ensureAuthenticated } from '@/src/utils/auth/ensure-authenticated';

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  await ensureAuthenticated();

  const { id } = await params;
  return (
    <MainShell>
      <ChannelDataProvider channelId={id}>{children}</ChannelDataProvider>
    </MainShell>
  );
}
