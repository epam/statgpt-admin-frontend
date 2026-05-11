import { ReactNode } from 'react';

import { MainShell } from '@/src/components/MainShell/MainShell';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <MainShell>{children}</MainShell>;
}
