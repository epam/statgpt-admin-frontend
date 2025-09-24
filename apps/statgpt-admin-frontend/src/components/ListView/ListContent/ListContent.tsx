'use client';

import { ColDef, GridOptions } from 'ag-grid-community';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

import { Menu, MenuUrl } from '@/src/constants/menu';
import { BaseEntity } from '@/src/models/base-entity';
import { GridView } from '@/src/components/GridView/GridView';
import { ListHeader } from '../ListHeader/ListHeader';

interface Props {
  menuItem: Menu;
  colDefs: ColDef[];
  data: BaseEntity[];
  emptyDataTitle: string;
}

export const ListContent: FC<Props> = ({
  menuItem,
  colDefs,
  emptyDataTitle,
  data,
}) => {
  const router = useRouter();
  const columns = colDefs.map((col) => {
    if (col.field === 'metadata.publication_date') {
      return {
        ...col,
        valueGetter: ({
          data,
        }: {
          data: { metadata: { publication_date: string } };
        }) => new Date(data.metadata.publication_date).getTime(),
        valueFormatter: ({ value }: { value: string }) =>
          new Date(value).toLocaleDateString(),
      };
    }
    if (col.field === 'created_at') {
      return {
        ...col,
        ...col,
        valueGetter: ({ data }: { data: { created_at: string } }) =>
          new Date(data.created_at).getTime(),
        valueFormatter: ({ value }: { value: string }) =>
          new Date(value).toLocaleString(),
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

  return (
    <>
      <ListHeader title={menuItem} count={data.length} />
      <div className="flex-1 min-h-0 mt-4">
        <GridView
          colDefs={columns}
          data={data}
          emptyDataTitle={emptyDataTitle}
          additionalOptions={gridOptions}
        />
      </div>
    </>
  );
};
