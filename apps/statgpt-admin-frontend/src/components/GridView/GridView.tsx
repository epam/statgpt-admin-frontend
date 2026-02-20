'use client';

import {
  AllCommunityModule,
  ColDef,
  colorSchemeDark,
  GridApi,
  GridOptions,
  ITooltipParams,
  IGetRowsParams,
  IDatasource,
  ModuleRegistry,
  themeBalham,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ActionColumn } from '@/src/components/ListView/ActionColumn/ActionColumn';
import { ACTION_COLUMN_CELL_RENDERER_KEY } from '@/src/constants/columns/action';
import { BaseEntity } from '@/src/models/base-entity';
import { EmptyState } from './EmptyState/EmptyState';
import { DEFAULT_GRID_PAGE_SIZE } from '@/src/constants/columns/grid';
import {
  AUDIT_LOG_DETAILS_CELL_RENDERER_KEY,
  AuditLogDetailsCellRenderer,
} from '../AuditLogs/AuditLogDetails/AuditLogDetailsCellRenderer';

export interface FetchRowsArgs {
  offset: number;
  limit: number;
  sortModel?: unknown;
  filterModel?: unknown;
}

export interface FetchRowsResult<T> {
  rows: T[];
  total?: number;
}

interface Props<T = BaseEntity> {
  colDefs: ColDef[];
  emptyDataTitle: string;
  additionalOptions?: GridOptions;
  data?: T[];
  fetchRows?: (args: FetchRowsArgs) => Promise<FetchRowsResult<T>>;
  pageSize?: number;
  queryKey?: string;
  refreshToken?: number;
}

ModuleRegistry.registerModules([AllCommunityModule]);

const GRID_CUSTOM_COMPONENT = {
  [ACTION_COLUMN_CELL_RENDERER_KEY]: ActionColumn,
  [AUDIT_LOG_DETAILS_CELL_RENDERER_KEY]: AuditLogDetailsCellRenderer,
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

export function GridView<T = BaseEntity>({
  data,
  colDefs,
  emptyDataTitle,
  additionalOptions,
  fetchRows,
  pageSize = DEFAULT_GRID_PAGE_SIZE,
  queryKey,
  refreshToken,
}: Props<T>) {
  const [api, setApi] = useState<GridApi | null>(null);

  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const isInfinite = typeof fetchRows === 'function';

  useEffect(() => {
    if (!api || !isInfinite) return;
    api.purgeInfiniteCache();
  }, [api, isInfinite, queryKey, refreshToken]);

  useEffect(() => {
    if (api != null) {
      api.sizeColumnsToFit();
    }
  }, [colDefs, api]);

  const datasource: IDatasource | undefined = useMemo(() => {
    if (!fetchRows) return undefined;

    const ds: IDatasource = {
      rowCount: undefined,
      getRows: async (params: IGetRowsParams) => {
        const { startRow, endRow, sortModel, filterModel } = params;
        const limit = endRow - startRow;

        try {
          const res = await fetchRows({
            offset: startRow,
            limit,
            sortModel,
            filterModel,
          });

          if (!aliveRef.current) return;

          const lastRow =
            typeof res.total === 'number'
              ? res.total
              : res.rows.length < limit
                ? startRow + res.rows.length
                : undefined;

          params.successCallback(res.rows, lastRow);
        } catch {
          if (!aliveRef.current) return;
          params.failCallback();
        }
      },
    };

    return ds;
  }, [fetchRows]);

  const shouldShowEmpty = !isInfinite && (!data || data.length === 0);

  return shouldShowEmpty ? (
    <EmptyState title={emptyDataTitle} />
  ) : (
    <div className="ag-theme-balham-dark h-full">
      <AgGridReact
        columnDefs={colDefs}
        theme={themeBalham
          .withPart(colorSchemeDark)
          .withParams({ ...GRID_THEME_COLORS })}
        headerHeight={28}
        rowHeight={32}
        suppressCellFocus={true}
        components={GRID_CUSTOM_COMPONENT}
        onGridReady={(e) => {
          setApi(e.api);

          if (datasource) {
            e.api.setGridOption('datasource', datasource);
          }
        }}
        tooltipShowDelay={500}
        defaultColDef={{
          floatingFilter: true,
          tooltipValueGetter: (p: ITooltipParams) =>
            p.data?.[(p.colDef as ColDef)?.field || ''],
        }}
        onGridSizeChanged={(e) => e.api.sizeColumnsToFit()}
        rowModelType={isInfinite ? 'infinite' : undefined}
        rowData={isInfinite ? undefined : (data ?? [])}
        cacheBlockSize={isInfinite ? pageSize : undefined}
        maxBlocksInCache={isInfinite ? 5 : undefined}
        infiniteInitialRowCount={isInfinite ? pageSize : undefined}
        {...additionalOptions}
      />
    </div>
  );
}
