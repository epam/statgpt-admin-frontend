'use client';

import { useMemo } from 'react';

import { getDataSetsColumnsWithActions } from '@/src/constants/columns/grid-columns';
import { ListView } from '@/src/components/ListView/ListView';
import { Menu } from '@/src/constants/menu';
import { DataSet } from '@/src/models/data-sets';

interface Props {
  data: DataSet[];
  dataSources: string[];
  initialError?: string | null;
}

export function DataSetsView({ data, dataSources, initialError }: Props) {
  const colDefs = useMemo(
    () => getDataSetsColumnsWithActions(dataSources),
    [dataSources],
  );

  return (
    <ListView
      menuItem={Menu.DATA_SETS}
      colDefs={colDefs}
      data={data}
      emptyDataTitle="No Datasets"
      initialError={initialError}
    />
  );
}
