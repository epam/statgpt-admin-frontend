import { FC } from 'react';

import Channels from '@/public/icons/menu/channels.svg';
import DataSource from '@/public/icons/menu/data-sources.svg';
import DataSets from '@/public/icons/menu/datasets.svg';
import Documents from '@/public/icons/menu/documents.svg';
import { Menu, MenuUrl } from '@/src/constants/menu';
import { MenuItem } from './MenuItem/MenuItem';

interface Props {
  disableMenuItems?: string;
}
export const MenuSideBar: FC<Props> = ({ disableMenuItems }) => {
  const disableItems = disableMenuItems
    ? disableMenuItems.split(',').map((item) => item.toLowerCase().trim())
    : [];

  return (
    <nav className="flex flex-col p-2 bg-layer-3 w-[260px]">
      {!disableItems.includes('datasources') && (
        <MenuItem
          icon={<DataSource />}
          title={Menu.DATA_SOURCES}
          url={MenuUrl.DATA_SOURCES}
        />
      )}

      {!disableItems.includes('datasources') && (
        <MenuItem
          icon={<DataSets />}
          title={Menu.DATA_SETS}
          url={MenuUrl.DATA_SETS}
        />
      )}

      {!disableItems.includes('documents') && (
        <MenuItem
          icon={<Documents />}
          title={Menu.DOCUMENTS}
          url={MenuUrl.DOCUMENTS}
        />
      )}

      {!disableItems.includes('channels') && (
        <MenuItem
          icon={<Channels />}
          title={Menu.CHANNELS}
          url={MenuUrl.CHANNELS}
        />
      )}
    </nav>
  );
};
