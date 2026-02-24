'use client';

import { EnumSelectFilterModel } from '@/src/models/grid';
import { normalizeEnumValues } from '@/src/utils/client/grid';
import React, { useMemo } from 'react';

export interface EnumSelectFloatingFilterProps {
  model: EnumSelectFilterModel;
  onModelChange: (model: EnumSelectFilterModel) => void;
  values: readonly string[];
  allLabel?: string;
  formatValue?: (v: string) => string;
}

export function EnumSelectFloatingFilter({
  model,
  onModelChange,
  values,
  allLabel = 'All',
  formatValue,
}: EnumSelectFloatingFilterProps) {
  const options = useMemo(() => normalizeEnumValues(values), [values]);
  const selected = model?.value ?? '';

  return (
    <select
      className="w-full rounded border border-primary bg-layer-1 my-[1px] px-1 text-xs text-primary outline-none"
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
  );
}
