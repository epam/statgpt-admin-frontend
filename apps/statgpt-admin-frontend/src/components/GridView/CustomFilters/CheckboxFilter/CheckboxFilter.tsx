'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useGridFilter } from 'ag-grid-react';

import { GridCheckboxFilterModel } from '@/src/models/grid';
import { normalizeEnumValues } from '@/src/utils/client/grid';

interface Props {
  model: GridCheckboxFilterModel;
  onModelChange: (model: GridCheckboxFilterModel) => void;
  values: readonly string[];
  colDef?: { headerName?: string; field?: string };
}

function getNestedValue(data: unknown, field: string): string {
  const parts = field.split('.');
  let cur: unknown = data;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return '';
    cur = (cur as Record<string, unknown>)[part];
  }
  return String(cur ?? '');
}

export function CheckboxFilter({
  model,
  onModelChange,
  values,
  colDef,
}: Props) {
  const [search, setSearch] = useState('');
  const modelRef = useRef(model);
  modelRef.current = model;
  const colDefRef = useRef(colDef);
  colDefRef.current = colDef;

  const options = useMemo(() => normalizeEnumValues(values), [values]);
  const selected = model?.values ?? [];
  const allSelected = selected.length === 0;

  const visible = useMemo(() => {
    if (!search.trim()) return options;
    const lc = search.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(lc));
  }, [options, search]);

  useGridFilter({
    doesFilterPass({ data }) {
      const m = modelRef.current;
      if (!m || !m.values.length) return true;
      const field = colDefRef.current?.field ?? '';
      return m.values.includes(getNestedValue(data, field));
    },
  });

  const toggleValue = useCallback(
    (value: string, checked: boolean) => {
      const cur = modelRef.current?.values ?? [];
      const next = checked ? [...cur, value] : cur.filter((v) => v !== value);
      onModelChange(next.length ? { values: next } : null);
    },
    [onModelChange],
  );

  const reset = useCallback(() => {
    onModelChange(null);
    setSearch('');
  }, [onModelChange]);

  return (
    <div className="flex flex-col gap-2 p-2 min-w-[200px] max-w-[280px]">
      <div className="text-xs font-semibold text-secondary">
        {colDef?.headerName ?? colDef?.field ?? 'Filter'}
      </div>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded border border-primary bg-layer-3 px-2 py-1 text-sm text-primary outline-none placeholder:text-secondary"
      />

      <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-primary">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => onModelChange(null)}
          className="cursor-pointer"
        />
        All
      </label>

      {visible.length > 0 && (
        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
          {visible.map((v) => (
            <label
              key={v}
              className="flex cursor-pointer select-none items-center gap-2 text-sm text-primary"
            >
              <input
                type="checkbox"
                checked={selected.includes(v)}
                onChange={(e) => toggleValue(v, e.target.checked)}
                className="cursor-pointer"
              />
              <span className="truncate" title={v}>
                {v}
              </span>
            </label>
          ))}
        </div>
      )}

      {visible.length === 0 && search.trim() && (
        <div className="text-xs text-secondary">No matches</div>
      )}

      <button
        type="button"
        onClick={reset}
        className="mt-1 rounded border border-primary bg-layer-3 px-2 py-1 text-xs text-primary transition-colors hover:bg-layer-4"
      >
        Reset
      </button>
    </div>
  );
}
