'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export const NextAuthProvider = ({
  children,
  isAuthEnabled,
}: {
  children: ReactNode;
  isAuthEnabled: boolean;
}) => {
  // A `null` initial session stops SessionProvider from fetching /api/auth/session,
  // which fails when Auth.js is not configured.
  return (
    <SessionProvider session={isAuthEnabled ? undefined : null}>
      {children}
    </SessionProvider>
  );
};
