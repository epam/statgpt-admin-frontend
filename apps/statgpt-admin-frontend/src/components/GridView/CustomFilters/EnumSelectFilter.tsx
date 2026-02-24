'use client';

import { EnumSelectFilterModel } from '@/src/models/grid';
import { normalizeEnumValues } from '@/src/utils/client/grid';
import React, { useMemo } from 'react';

export interface EnumSelectFilterProps {
  model: EnumSelectFilterModel;
  onModelChange: (model: EnumSelectFilterModel) => void;
  values: readonly string[];
  allLabel?: string;
  formatValue?: (v: string) => string;
  colDef?: { headerName?: string; field?: string };
}

export function EnumSelectFilter({
  model,
  onModelChange,
  values,
  allLabel = 'All',
  formatValue,
  colDef,
}: EnumSelectFilterProps) {
  const options = useMemo(() => normalizeEnumValues(values), [values]);
  const selected = model?.value ?? '';

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-xs text-secondary">
        {colDef?.headerName ?? colDef?.field ?? 'Filter'}
      </div>

      <select
        className="w-full rounded border border-primary bg-layer-2 px-2 py-1 text-sm text-primary outline-none"
        value={selected}
        onChange={(e) => {
          const next = e.target.value;
          onModelChange(next ? { value: next } : null);
        }}
      >
        <option value="">{allLabel}</option>

        {options.map((v) => (
          <option key={v} value={v}>
            {formatValue ? formatValue(v) : v}
          </option>
        ))}
      </select>
    </div>
  );
}
