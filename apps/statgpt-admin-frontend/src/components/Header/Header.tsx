'use client';

import { usePathname, useRouter } from 'next/navigation';
import CollapseMenuIcon from '@/public/icons/menu/collapse-menu.svg';
import ExpandMenuIcon from '@/public/icons/menu/expand-menu.svg';
import { MENU_MAP, MenuUrl } from '@/src/constants/menu';
import { Breadcrumb } from '@/src/models/breadcrumbs';
import { Breadcrumbs } from '@/src/components/Breadcrumbs/Breadcrumbs';
import { UserMenu } from '@/src/components/Header/User/UserMenu';
import { useNavigationLoading } from '@/src/context/NavigationLoadingContext';
import { useSidebar } from '@/src/context/SidebarContext';

interface HeaderProps {
  showBreadcrumbs?: boolean;
}

export const Header = ({ showBreadcrumbs = true }: HeaderProps) => {
  const pathname = usePathname() as MenuUrl;
  const router = useRouter();
  const { isLoading } = useNavigationLoading();
  const { isCollapsed, toggle } = useSidebar();

  const segments = pathname.split('/').filter(Boolean);
  const [root, channelId, sub, datasetId, leaf] = segments;

  const url = `/${root}` as MenuUrl;
  const breadcrumbs: Breadcrumb[] = [
    {
      name: MENU_MAP[url],
      click: () => {
        router.replace(url);
      },
    },
  ];

  if (channelId != null && channelId !== '') {
    breadcrumbs.push({
      name: channelId,
      click: () => router.push(`/channels/${channelId}`),
    });
  }

  if (sub === 'glossary') {
    breadcrumbs.push({ name: 'Terms' });
  } else if (sub === 'jobs') {
    breadcrumbs.push({ name: 'Jobs' });
  } else if (sub === 'datasets' && datasetId != null && leaf === 'versions') {
    breadcrumbs.push({
      name: datasetId,
      click: () =>
        router.push(`/channels/${channelId}/datasets/${datasetId}/versions`),
    });
    breadcrumbs.push({ name: 'Versions' });
  }

  return (
    <header className="h-[48px] flex items-center bg-layer-3 w-full justify-between border-b border-solid border-b-tertiary">
      <div className="flex flex-row items-center">
        <div className="w-[65px] h-[48px] flex items-center justify-center shrink-0 border-r border-tertiary">
          <button
            onClick={toggle}
            className="cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ExpandMenuIcon className="size-6" />
            ) : (
              <CollapseMenuIcon className="size-6" />
            )}
          </button>
        </div>
        <span className="pl-5 whitespace-nowrap">
          <span className="mr-1">StatGPT</span>
          <span className="gradient">ADMIN</span>
        </span>
        {showBreadcrumbs && (
          <div className="pl-[36px]">
            {isLoading ? (
              <div className="h-4 w-32 rounded bg-layer-4 animate-pulse" />
            ) : (
              <Breadcrumbs breadcrumbs={breadcrumbs} />
            )}
          </div>
        )}
      </div>

      <UserMenu />
    </header>
  );
};
