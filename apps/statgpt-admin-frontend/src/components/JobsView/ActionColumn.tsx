import { IconDots } from '@tabler/icons-react';
import { CustomCellRendererProps } from 'ag-grid-react';
import { FC, useState } from 'react';

import {
  Menu as DropdownMenu,
  MenuItem as DropdownMenuItem,
} from '@/src/components/BaseComponents/Dropdown/DropdownMenu';
import { EntityOperation } from '@/src/constants/columns/action';
import { BASE_ICON_PROPS } from '@/src/constants/layout';
import { ActionItem } from '@/src/components/GridView/ActionColumn/ActionItem';
import { Job, JobStatus } from '@/src/models/job';

export const JobsActionColumn: FC<CustomCellRendererProps> = ({ data }) => {
  const [, setIsOpen] = useState(false);

  return (
    <>
      {(data as Job).status !== JobStatus.FAILED && (
        <DropdownMenu
          className="flex items-center justify-center w-full relative"
          onOpenChange={setIsOpen}
          width={200}
          type="contextMenu"
          trigger={<IconDots {...BASE_ICON_PROPS} widths={16} height={16} />}
        >
          <DropdownMenuItem
            className="hover:bg-accent-primary-alpha"
            item={<ActionItem item={EntityOperation.Export} />}
            onClick={() => {
              window.open(`/api/v1/channels/download/${data.id}`, '_blank');
            }}
          />
        </DropdownMenu>
      )}
    </>
  );
};
