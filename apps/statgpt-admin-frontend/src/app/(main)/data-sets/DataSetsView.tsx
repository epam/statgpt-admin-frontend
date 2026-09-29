'use client';

import { useMemo } from 'react';

import { getDataSetsColumnsWithActions } from '@/src/constants/columns/grid-columns';
import { ListView } from '@/src/components/ListView/ListView';
import { Menu } from '@/src/constants/menu';
import { DataSet } from '@/src/models/data-sets';

interface Props {
  data: DataSet[];
  initialError?: string | null;
}

export function DataSetsView({ data, initialError }: Props) {
  const colDefs = useMemo(() => getDataSetsColumnsWithActions(), []);

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
