'use client';

import { ColDef, GridOptions } from 'ag-grid-community';
import { useRouter } from 'next/navigation';
import { useMemo, useCallback, useEffect } from 'react';

import { Menu, MenuUrl } from '@/src/constants/menu';
import { BaseEntity } from '@/src/models/base-entity';
import {
  GridView,
  FetchRowsArgs,
  FetchRowsResult,
} from '@/src/components/GridView/GridView';
import { ListHeader } from '../ListHeader/ListHeader';
import { useNotification } from '@/src/context/NotificationContext';
import { NotificationType } from '@/src/models/notification';

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
  initialError?: string | null;
}

export function ListContent<T = BaseEntity>({
  menuItem,
  colDefs,
  emptyDataTitle,
  data,
  fetchRows,
  pageSize,
  totalCount,
  queryKey,
  refreshToken,
  withHeader = true,
  initialError,
}: Props<T>) {
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (initialError) {
      showNotification({
        type: NotificationType.error,
        title: 'Failed to load data',
        description: initialError,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCellClicked = useCallback(
    (event: any) => {
      if (event.colDef.field == null || menuItem !== Menu.CHANNELS) {
        return;
      }

      if (event.data?.id && menuItem === Menu.CHANNELS) {
        router.push(`${MenuUrl.CHANNELS}/${event.data.id}`);
      }
    },
    [menuItem, router],
  );

  const gridOptions: GridOptions = useMemo(
    () => ({
      onCellClicked,
    }),
    [onCellClicked],
  );

  const columns: ColDef[] = useMemo(() => {
    return colDefs.map((col) => {
      if (col.field === 'metadata.publication_date') {
        return {
          ...col,
          valueGetter: ({
            data,
          }: {
            data: { metadata?: { publication_date?: string } };
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
          valueGetter: ({ data }: { data: { created_at?: string } }) =>
            data?.created_at ? new Date(data.created_at).getTime() : null,
          valueFormatter: ({ value }: { value: number | null }) =>
            value ? new Date(value).toLocaleString() : '',
        };
      }

      return col;
    });
  }, [colDefs]);

  const headerCount =
    typeof totalCount === 'number' ? totalCount : data?.length;

  return (
    <>
      {withHeader && <ListHeader title={menuItem} count={headerCount ?? 0} />}
      <div className="flex-1 min-h-0 mt-4">
        <GridView<T>
          colDefs={columns}
          data={data}
          fetchRows={fetchRows}
          pageSize={pageSize}
          emptyDataTitle={emptyDataTitle}
          additionalOptions={gridOptions}
          queryKey={queryKey}
          refreshToken={refreshToken}
        />
      </div>
    </>
  );
}
