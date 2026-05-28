import { ICellRendererParams } from 'ag-grid-community';
import { FC, useEffect, useState } from 'react';

import { mergeClasses } from '@/src/utils/mergeClasses';

/**
 * AG Grid cell renderer that displays a single-select radio button reflecting
 * the row's selection state. Designed to be used as the `cellRenderer` of a
 * dedicated selection column when AG Grid's built-in checkbox column is
 * disabled (`rowSelection.checkboxes: false`).
 *
 * Clicking the radio selects the row via `node.setSelected(true)`. Row-level
 * selection events keep the radio in sync, so clicking elsewhere on the row
 * (when `enableClickSelection: true`) also updates the visual.
 */
export const RadioSelectionCellRenderer: FC<ICellRendererParams> = (params) => {
  const [selected, setSelected] = useState<boolean>(
    params.node.isSelected() ?? false,
  );

  useEffect(() => {
    const handler = () => {
      setSelected(params.node.isSelected() ?? false);
    };
    params.api.addEventListener('selectionChanged', handler);
    return () => {
      params.api.removeEventListener('selectionChanged', handler);
    };
  }, [params.api, params.node]);

  return (
    <button
      type="button"
      aria-checked={selected}
      role="radio"
      className={mergeClasses(
        'flex items-center justify-center w-[18px] h-[18px] p-0 m-0 rounded-full border-2 bg-transparent cursor-pointer',
        selected ? 'border-accent-primary' : 'border-hover',
      )}
      onClick={(e) => {
        e.stopPropagation();
        params.node.setSelected(true);
      }}
    >
      {selected && (
        <span className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
      )}
    </button>
  );
};
