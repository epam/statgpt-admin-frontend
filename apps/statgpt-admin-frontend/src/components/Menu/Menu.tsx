'use client';

import { FC } from 'react';

import Channels from '@/public/icons/menu/channels.svg';
import DataSource from '@/public/icons/menu/data-sources.svg';
import DataSets from '@/public/icons/menu/datasets.svg';
import Documents from '@/public/icons/menu/documents.svg';
import { Menu, MenuUrl } from '@/src/constants/menu';
import { useNavigationLoading } from '@/src/context/NavigationLoadingContext';
import { useSidebar } from '@/src/context/SidebarContext';
import { mergeClasses } from '@/src/utils/mergeClasses';
import { MenuItem } from './MenuItem/MenuItem';
import { MenuItemSkeleton } from './MenuItem/MenuItemSkeleton';
import { IconLogs } from '@tabler/icons-react';

interface Props {
  disableMenuItems?: string;
}

export const MenuSideBar: FC<Props> = ({ disableMenuItems }) => {
  const { isLoading } = useNavigationLoading();
  const { isCollapsed } = useSidebar();
  const disableItems = disableMenuItems
    ? disableMenuItems.split(',').map((item) => item.toLowerCase().trim())
    : [];

  return (
    <nav
      className={mergeClasses(
        'flex flex-col p-2 bg-layer-3 shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out',
        isCollapsed ? 'w-16' : 'w-[260px]',
      )}
    >
      {isLoading ? (
        <>
          <MenuItemSkeleton isCollapsed={isCollapsed} />
          <MenuItemSkeleton isCollapsed={isCollapsed} />
          <MenuItemSkeleton isCollapsed={isCollapsed} />
          <MenuItemSkeleton isCollapsed={isCollapsed} />
          <MenuItemSkeleton isCollapsed={isCollapsed} />
        </>
      ) : (
        <>
          {!disableItems.includes('datasources') && (
            <MenuItem
              icon={<DataSource />}
              title={Menu.DATA_SOURCES}
              url={MenuUrl.DATA_SOURCES}
              isCollapsed={isCollapsed}
            />
          )}

          {!disableItems.includes('datasources') && (
            <MenuItem
              icon={<DataSets />}
              title={Menu.DATA_SETS}
              url={MenuUrl.DATA_SETS}
              isCollapsed={isCollapsed}
            />
          )}

          {!disableItems.includes('documents') && (
            <MenuItem
              icon={<Documents />}
              title={Menu.DOCUMENTS}
              url={MenuUrl.DOCUMENTS}
              isCollapsed={isCollapsed}
            />
          )}

          {!disableItems.includes('channels') && (
            <MenuItem
              icon={<Channels />}
              title={Menu.CHANNELS}
              url={MenuUrl.CHANNELS}
              isCollapsed={isCollapsed}
            />
          )}

          {!disableItems.includes('audit-logs') && (
            <MenuItem
              icon={<IconLogs className="size-[18px]" />}
              title={Menu.AUDIT_LOGS}
              url={MenuUrl.AUDIT_LOGS}
              isCollapsed={isCollapsed}
            />
          )}
        </>
      )}
    </nav>
  );
};
