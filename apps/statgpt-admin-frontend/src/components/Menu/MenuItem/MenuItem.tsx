'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, ReactNode } from 'react';

import { Menu, MenuUrl } from '@/src/constants/menu';

interface Props {
  url: MenuUrl;
  title: Menu;
  icon: ReactNode;
}

export const MenuItem: FC<Props> = ({ url, title, icon }) => {
  const pathname = usePathname();
  const menuLinkClass = classNames(
    'rounded border-l-2 border-solid border-l-transparent mb-1 flex items-center small',
    'h-[34px] pt-2 pb-2 pl-3 pr-3',
    pathname === url || pathname.includes(`${url}/`)
      ? 'border-l-accent-secondary bg-accent-secondary-alpha'
      : '',
  );
  return (
    <Link className={menuLinkClass} href={`${url}`}>
      {icon}
      <div className="ml-4"> {title}</div>
    </Link>
  );
};
