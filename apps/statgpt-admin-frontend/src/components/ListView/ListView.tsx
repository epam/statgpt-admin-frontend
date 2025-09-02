import { ColDef } from 'ag-grid-community';
import { FC } from 'react';

import { Menu } from '@/src/constants/menu';
import { BaseEntity } from '@/src/models/base-entity';
import { ListContent } from './ListContent/ListContent';

interface Props {
  menuItem: Menu;
  colDefs: ColDef[];
  data: BaseEntity[];
  emptyDataTitle: string;
}

export const ListView: FC<Props> = ({
  menuItem,
  colDefs,
  emptyDataTitle,
  data,
}) => {
  return (
    <div className="flex flex-col h-full rounded bg-layer-2 common-paddings">
      <ListContent
        menuItem={menuItem}
        colDefs={colDefs}
        data={data}
        emptyDataTitle={emptyDataTitle}
      />
    </div>
  );
};
