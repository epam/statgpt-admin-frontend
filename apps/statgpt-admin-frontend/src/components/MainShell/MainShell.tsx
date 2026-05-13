import { ReactNode } from 'react';

import { Header } from '@/src/components/Header/Header';
import { MenuSideBar } from '@/src/components/Menu/Menu';
import { NavigationLoadingProvider } from '@/src/context/NavigationLoadingContext';

export function MainShell({ children }: { children: ReactNode }) {
  return (
    <NavigationLoadingProvider>
      <div className="flex h-full flex-col">
        <Header />
        <div className="flex flex-row h-full">
          <MenuSideBar disableMenuItems={process.env.DISABLE_MENU_ITEMS} />
          <div className="flex-1 min-w-0 p-4">{children}</div>
        </div>
      </div>
    </NavigationLoadingProvider>
  );
}
