import { Inter } from 'next/font/google';

import { AccessControlProvider } from '@/src/context/AccessControlContext';
import { NotificationProvider } from '@/src/context/NotificationContext';
import { SidebarProvider } from '@/src/context/SidebarContext';
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
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/favicon.svg" sizes="any" />
      </head>
      <body className={inter.variable}>
        <NotificationProvider>
          <NextAuthProvider>
            <AccessControlProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </AccessControlProvider>
          </NextAuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
