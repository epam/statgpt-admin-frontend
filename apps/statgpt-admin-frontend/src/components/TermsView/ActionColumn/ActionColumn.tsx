import { CustomCellRendererProps } from 'ag-grid-react';
import { FC, useState } from 'react';

import More from '@/public/icons/more-horizontal.svg';
import {
  Menu as DropdownMenu,
  MenuItem as DropdownMenuItem,
} from '@/src/components/BaseComponents/Dropdown/DropdownMenu';
import { EntityOperation } from '@/src/constants/columns/action';
import { ChannelTerm } from '@/src/models/channel';
import { ActionItem } from './ActionItem/ActionItem';
import styles from './action-column.module.scss';

interface Props extends CustomCellRendererProps {
  items: EntityOperation[];
  edit?: (data?: ChannelTerm) => void;
  remove?: (data?: ChannelTerm) => void;
}

export const ActionColumn: FC<Props> = ({ items, remove, edit, data }) => {
  const [, setIsOpen] = useState(false);

  return (
    <>
      <DropdownMenu
        className={styles.column}
        onOpenChange={setIsOpen}
        width={200}
        type="contextMenu"
        trigger={<More />}
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
