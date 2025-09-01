'use client';

import {
  AllCommunityModule,
  ColDef,
  colorSchemeDark,
  GridApi,
  GridOptions,
  ITooltipParams,
  ModuleRegistry,
  themeBalham,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { FC, useEffect, useState } from 'react';

import { ActionColumn } from '@/src/components/ListView/ActionColumn/ActionColumn';
import { ACTION_COLUMN_CELL_RENDERER_KEY } from '@/src/constants/columns/action';
import { BaseEntity } from '@/src/models/base-entity';
import { EmptyState } from './EmptyState/EmptyState';

interface Props {
  colDefs: ColDef[];
  data: BaseEntity[];
  emptyDataTitle: string;
  additionalOptions?: GridOptions;
}
ModuleRegistry.registerModules([AllCommunityModule]);

const GRID_CUSTOM_COMPONENT = {
  [ACTION_COLUMN_CELL_RENDERER_KEY]: ActionColumn,
};

const GRID_THEME_COLORS = {
  accentColor: 'var(--controls-bg-accent, #5C8DEA)',
  backgroundColor: 'var(--bg-layer-2, #141A23)',
  borderColor: 'var(--bg-layer-4, #333942)',
  borderRadius: 3,
  browserColorScheme: 'dark',
  chromeBackgroundColor: 'var(--bg-layer-1, #090D13)',
  foregroundColor: 'var(--text-primary, #F3F4F6)',
  headerFontSize: 14,
  headerFontWeight: 600,
  headerTextColor: 'var(--text-secondary, #7F8792)',
  oddRowBackgroundColor: 'var(--bg-layer-3, #222932)',
  spacing: 4,
  wrapperBorderRadius: 3,
  fontSize: 14,
  fontFamily: {
    googleFont: 'var(--theme-font, var(--font-inter))',
  },
};

export const GridView: FC<Props> = ({
  data,
  colDefs,
  emptyDataTitle,
  additionalOptions,
}) => {
  const [api, setApi] = useState<GridApi | null>(null);

  useEffect(() => {
    if (api != null) {
      api.sizeColumnsToFit();
    }
  }, [colDefs, api]);

  return data.length ? (
    <div className="ag-theme-balham-dark h-full">
      <AgGridReact
        rowData={data}
        columnDefs={colDefs}
        theme={themeBalham
          .withPart(colorSchemeDark)
          .withParams({ ...GRID_THEME_COLORS })}
        headerHeight={28}
        rowHeight={32}
        suppressCellFocus={true}
        components={GRID_CUSTOM_COMPONENT}
        onGridReady={(e) => setApi(e.api)}
        tooltipShowDelay={500}
        defaultColDef={{
          floatingFilter: true,
          tooltipValueGetter: (p: ITooltipParams) =>
            p.data[(p.colDef as ColDef)?.field || ''],
        }}
        onGridSizeChanged={(e) => e.api.sizeColumnsToFit()}
        {...additionalOptions}
      />
    </div>
  ) : (
    <EmptyState title={emptyDataTitle} />
  );
};
