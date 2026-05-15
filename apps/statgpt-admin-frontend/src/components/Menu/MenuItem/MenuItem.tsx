'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, ReactNode } from 'react';

import { Menu, MenuUrl } from '@/src/constants/menu';
import { mergeClasses } from '@/src/utils/mergeClasses';

interface Props {
  url: MenuUrl;
  title: Menu;
  icon: ReactNode;
  isCollapsed?: boolean;
}

export const MenuItem: FC<Props> = ({
  url,
  title,
  icon,
  isCollapsed = false,
}) => {
  const pathname = usePathname();
  const isActive = pathname === url || pathname.includes(`${url}/`);
  const menuLinkClass = mergeClasses(
    'rounded border-l-2 border-solid mb-1 flex items-center small',
    'h-[34px] pt-2 pb-2 pl-3 pr-3',
    isActive
      ? 'border-l-accent-secondary bg-accent-secondary-alpha'
      : 'border-l-transparent',
  );
  return (
    <Link
      className={menuLinkClass}
      href={`${url}`}
      title={isCollapsed ? title : undefined}
    >
      <span className="shrink-0">{icon}</span>
      <div
        className={mergeClasses(
          'overflow-hidden whitespace-nowrap transition-opacity',
          isCollapsed
            ? 'w-0 ml-0 opacity-0 duration-100'
            : 'ml-4 opacity-100 duration-150 delay-[180ms]',
        )}
      >
        {title}
      </div>
    </Link>
  );
};
