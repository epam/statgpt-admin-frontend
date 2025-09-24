import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Inter } from 'next/font/google';

import { Header } from '@/src/components/Header/Header';
import { MenuSideBar } from '@/src/components/Menu/Menu';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { NotificationProvider } from '@/src/context/NotificationContext';
import { getIsInvalidSession, getUserToken } from '@/src/utils/auth/get-token';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';
import { NextAuthProvider } from './provider';
import './global.scss';

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
  children: React.ReactNode;
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
            <div className="flex h-full flex-col">
              <Header />

              <div className="flex flex-row h-full">
                <MenuSideBar
                  disableMenuItems={process.env.DISABLE_MENU_ITEMS}
                />
                <div className="flex-1 min-w-0 p-4">{children}</div>
              </div>
            </div>
          </NextAuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
