import { IconDots } from '@tabler/icons-react';
import { CustomCellRendererProps } from 'ag-grid-react';
import { FC, useState } from 'react';

import {
  Menu as DropdownMenu,
  MenuItem as DropdownMenuItem,
} from '@/src/components/BaseComponents/Dropdown/DropdownMenu';
import { ActionItem } from '@/src/components/GridView/ActionColumn/ActionItem';
import { EntityOperation } from '@/src/constants/columns/action';
import { BASE_ICON_PROPS } from '@/src/constants/layout';
import { ChannelTerm } from '@/src/models/channel';

interface Props extends CustomCellRendererProps {
  items: EntityOperation[];
  edit?: (data?: ChannelTerm) => void;
  remove?: (data?: ChannelTerm) => void;
}

export const TermsActionColumn: FC<Props> = ({ items, remove, edit, data }) => {
  const [, setIsOpen] = useState(false);

  return (
    <>
      <DropdownMenu
        className="flex items-center justify-center w-full relative"
        onOpenChange={setIsOpen}
        width={200}
        type="contextMenu"
        trigger={<IconDots {...BASE_ICON_PROPS} widths={16} height={16} />}
      >
        {items.map((item, i) => (
          <DropdownMenuItem
            key={i}
            className="hover:bg-accent-primary-alpha"
            item={<ActionItem item={item} />}
            onClick={() => {
              if (item === EntityOperation.Delete) {
                remove?.(data);
              }
              if (item === EntityOperation.Edit) {
                edit?.(data);
              }
            }}
          />
        ))}
      </DropdownMenu>
    </>
  );
};
