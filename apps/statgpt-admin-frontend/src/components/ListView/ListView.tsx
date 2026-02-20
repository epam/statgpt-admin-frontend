import { ColDef } from 'ag-grid-community';
import { ReactNode } from 'react';

import { Menu } from '@/src/constants/menu';
import { BaseEntity } from '@/src/models/base-entity';
import { ListContent } from './ListContent/ListContent';
import type {
  FetchRowsArgs,
  FetchRowsResult,
} from '@/src/components/GridView/GridView';

interface Props<T = BaseEntity> {
  menuItem: Menu;
  colDefs: ColDef[];
  emptyDataTitle: string;
  customHeader?: ReactNode;
  data?: T[];
  fetchRows?: (args: FetchRowsArgs) => Promise<FetchRowsResult<T>>;
  pageSize?: number;
  totalCount?: number;
}

export function ListView<T = BaseEntity>({
  menuItem,
  colDefs,
  emptyDataTitle,
  data,
  customHeader,
  fetchRows,
  pageSize,
  totalCount,
}: Props<T>) {
  return (
    <div className="flex flex-col h-full rounded bg-layer-2 common-paddings">
      <ListContent<T>
        menuItem={menuItem}
        colDefs={colDefs}
        data={data}
        fetchRows={fetchRows}
        pageSize={pageSize}
        totalCount={totalCount}
        emptyDataTitle={emptyDataTitle}
        customHeader={customHeader}
      />
    </div>
  );
}
