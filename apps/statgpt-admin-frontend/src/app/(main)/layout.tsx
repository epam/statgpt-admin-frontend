import { ReactNode } from 'react';

import { MainShell } from '@/src/components/MainShell/MainShell';
import { ensureAuthenticated } from '@/src/utils/auth/ensure-authenticated';

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  await ensureAuthenticated();

  return <MainShell>{children}</MainShell>;
}
