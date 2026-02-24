import { ColDef } from 'ag-grid-community';

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
  withHeader?: boolean;
  data?: T[];
  fetchRows?: (args: FetchRowsArgs) => Promise<FetchRowsResult<T>>;
  pageSize?: number;
  totalCount?: number;
  queryKey?: string;
  refreshToken?: number;
}

export function ListView<T = BaseEntity>({
  menuItem,
  colDefs,
  emptyDataTitle,
  data,
  withHeader,
  fetchRows,
  pageSize,
  totalCount,
  queryKey,
  refreshToken,
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
        withHeader={withHeader}
        queryKey={queryKey}
        refreshToken={refreshToken}
      />
    </div>
  );
}
