import { Inter } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { SIGN_IN_LINK } from '@/src/constants/auth';
import { AccessControlProvider } from '@/src/context/AccessControlContext';
import { NotificationProvider } from '@/src/context/NotificationContext';
import { getIsInvalidSession, getUserToken } from '@/src/utils/auth/get-token';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';
import { ReactNode } from 'react';
import './global.scss';
import { NextAuthProvider } from './provider';

export const metadata = {
  title: 'StatGPT Admin',
};

const inter = Inter({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-inter',
});

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isEnableAuth = getIsEnableAuthToggle();
  const token = await getUserToken(isEnableAuth, headers(), cookies());
  const isInvalidSession = await getIsInvalidSession(isEnableAuth, token);

  if (isInvalidSession) {
    return redirect(SIGN_IN_LINK);
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/favicon.svg" sizes="any" />
      </head>
      <body className={inter.variable}>
        <NotificationProvider>
          <NextAuthProvider>
            <AccessControlProvider>{children}</AccessControlProvider>
          </NextAuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
