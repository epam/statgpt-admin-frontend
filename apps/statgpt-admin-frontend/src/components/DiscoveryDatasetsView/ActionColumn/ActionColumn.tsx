'use client';

import { IconDots } from '@tabler/icons-react';
import { CustomCellRendererProps } from 'ag-grid-react';
import { FC, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  Menu as DropdownMenu,
  MenuItem as DropdownMenuItem,
} from '@/src/components/BaseComponents/Dropdown/DropdownMenu';
import { ActionItem } from '@/src/components/GridView/ActionColumn/ActionItem';
import { EntityOperation } from '@/src/constants/columns/action';
import { BASE_ICON_PROPS } from '@/src/constants/layout';
import { DiscoveryDataset } from '@/src/models/discovery-dataset';
import { DiscoveryDatasetDetailsView } from '../DetailsView/DiscoveryDatasetDetailsView';

interface Props extends CustomCellRendererProps {
  onDelete?: (id: number) => void;
}

export const DiscoveryDatasetActionColumn: FC<Props> = ({ data, onDelete }) => {
  const [, setIsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <DropdownMenu
        className="flex items-center justify-center w-full relative"
        onOpenChange={setIsOpen}
        width={200}
        type="contextMenu"
        trigger={<IconDots {...BASE_ICON_PROPS} widths={16} height={16} />}
      >
        <DropdownMenuItem
          className="hover:bg-accent-primary-alpha"
          item={<ActionItem item={EntityOperation.Details} />}
          onClick={() => setIsDetailsOpen(true)}
        />
        <DropdownMenuItem
          className="hover:bg-accent-primary-alpha"
          item={<ActionItem item={EntityOperation.Delete} />}
          onClick={() => onDelete?.((data as DiscoveryDataset).id)}
        />
      </DropdownMenu>
      {isDetailsOpen &&
        createPortal(
          <DiscoveryDatasetDetailsView
            data={data as DiscoveryDataset}
            close={() => setIsDetailsOpen(false)}
          />,
          document.body,
        )}
    </>
  );
};
