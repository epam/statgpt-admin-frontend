'use client';

import { ColDef, GridOptions } from 'ag-grid-community';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { Menu, MenuUrl } from '@/src/constants/menu';
import { BaseEntity } from '@/src/models/base-entity';
import {
  GridView,
  FetchRowsArgs,
  FetchRowsResult,
} from '@/src/components/GridView/GridView';
import { ListHeader } from '../ListHeader/ListHeader';

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

export function ListContent<T = BaseEntity>({
  menuItem,
  colDefs,
  emptyDataTitle,
  data,
  customHeader,
  fetchRows,
  pageSize,
  totalCount,
}: Props<T>) {
  const router = useRouter();
  const columns = colDefs.map((col) => {
    if (col.field === 'metadata.publication_date') {
      return {
        ...col,
        valueGetter: ({
          data,
        }: {
          data: { metadata: { publication_date: string } };
        }) =>
          data?.metadata?.publication_date
            ? new Date(data.metadata.publication_date).getTime()
            : null,
        valueFormatter: ({ value }: { value: number | null }) =>
          value ? new Date(value).toLocaleDateString() : '',
      };
    }
    if (col.field === 'created_at') {
      return {
        ...col,
        valueGetter: ({ data }: { data: { created_at: string } }) =>
          data?.created_at ? new Date(data.created_at).getTime() : null,
        valueFormatter: ({ value }: { value: number | null }) =>
          value ? new Date(value).toLocaleString() : '',
      };
    }
    return col;
  });

  const gridOptions: GridOptions = {
    onCellClicked: (event) => {
      if (event.colDef.field == null || menuItem !== Menu.CHANNELS) {
        //action column
        return;
      }

      if (event.data.id && menuItem === Menu.CHANNELS) {
        router.push(`${MenuUrl.CHANNELS}/${event.data.id}`);
      }
    },
  };

  const headerCount =
    typeof totalCount === 'number' ? totalCount : data?.length;

  return (
    <>
      {customHeader ? (
        customHeader
      ) : (
        <ListHeader title={menuItem} count={headerCount ?? 0} />
      )}

      <div className="flex-1 min-h-0 mt-4">
        <GridView<T>
          colDefs={columns}
          data={data}
          fetchRows={fetchRows}
          pageSize={pageSize}
          emptyDataTitle={emptyDataTitle}
          additionalOptions={gridOptions}
        />
      </div>
    </>
  );
}
