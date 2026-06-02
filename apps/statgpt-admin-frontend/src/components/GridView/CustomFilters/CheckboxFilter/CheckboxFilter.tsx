'use client';

import { useCallback, useMemo, useState } from 'react';

import Checkbox from '@/src/components/BaseComponents/Checkbox/Checkbox';
import { GridCheckboxFilterModel } from '@/src/models/grid';
import { normalizeEnumValues } from '@/src/utils/client/grid';

interface Props {
  model: GridCheckboxFilterModel;
  onModelChange: (model: GridCheckboxFilterModel) => void;
  values: readonly string[];
}

export function CheckboxFilter({ model, onModelChange, values }: Props) {
  const [search, setSearch] = useState('');

  const options = useMemo(() => normalizeEnumValues(values), [values]);
  const selected = model?.values ?? [];
  const allSelected = selected.length === 0;

  const visible = useMemo(() => {
    if (!search.trim()) return options;
    const lc = search.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(lc));
  }, [options, search]);

  const toggleValue = useCallback(
    (value: string, checked: boolean) => {
      const cur = model?.values ?? [];
      const next = checked ? [...cur, value] : cur.filter((v) => v !== value);
      onModelChange(next.length ? { values: next } : null);
    },
    [model, onModelChange],
  );

  const reset = useCallback(() => {
    onModelChange(null);
    setSearch('');
  }, [onModelChange]);

  return (
    <div className="flex flex-col gap-2 p-2 w-[280px] overflow-hidden">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="small-medium rounded border border-primary bg-layer-3 px-2 py-1 text-primary outline-none placeholder:text-secondary"
      />

      <div className="px-2 pb-2">
        <Checkbox
          id="checkbox-filter-all"
          label="All"
          checked={allSelected}
          onChange={() => onModelChange(null)}
        />
      </div>

      {visible.length > 0 && (
        <div className="flex max-h-[240px] flex-col gap-3 overflow-y-auto">
          {visible.map((v) => (
            <div key={v} className="w-full pl-6">
              <Checkbox
                id={`checkbox-filter-${v}`}
                label={v}
                checked={selected.includes(v)}
                onChange={(checked) => toggleValue(v, checked ?? false)}
              />
            </div>
          ))}
        </div>
      )}

      {visible.length === 0 && search.trim() && (
        <div className="small-medium text-secondary">No matches</div>
      )}

      <button type="button" onClick={reset} className="primary mt-1 self-end">
        Reset
      </button>
    </div>
  );
}
