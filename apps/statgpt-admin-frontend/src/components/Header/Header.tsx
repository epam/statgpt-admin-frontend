'use client';

import { usePathname, useRouter } from 'next/navigation';
import { MENU_MAP, MenuUrl } from '@/src/constants/menu';
import { Breadcrumb } from '@/src/models/breadcrumbs';
import { Breadcrumbs } from '@/src/components/Breadcrumbs/Breadcrumbs';
import { UserMenu } from '@/src/components/Header/User/UserMenu';

export const Header = () => {
  const pathname = usePathname() as MenuUrl;
  const router = useRouter();

  const [, root, selected, postfix] = pathname.split('/');

  const url = `/${root}` as MenuUrl;
  const breadcrumbs: Breadcrumb[] = [
    {
      name: MENU_MAP[url],
      click: () => {
        router.replace(url);
      },
    },
  ];

  if (selected != null && selected !== '') {
    breadcrumbs.push({ name: selected });
  }

  if (postfix != null && postfix !== '') {
    breadcrumbs.push({ name: 'Terms' });
  }

  return (
    <header className="h-[48px] pl-3 flex items-center bg-layer-3 w-full justify-between border-b border-solid border-b-tertiary">
      <div className="flex flex-row items-center">
        <div className="w-[250px]">
          <span className="mr-1">StatGPT</span>
          <span className="gradient">ADMIN</span>
        </div>
        <div className="pl-[36px]">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <UserMenu />
    </header>
  );
};
