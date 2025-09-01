'use client';

import { FC } from 'react';

interface Props {
  selectedItems?: string[];
}

const AutocompleteInputValue: FC<Props> = ({ selectedItems }) => {
  return (
    <ul className="flex flex-row items-center gap-x-2 truncate flex-wrap">
      {selectedItems?.map((selectedItem) => (
        <li key={selectedItem} className="tiny bg-layer-3 rounded p-1 border border-primary">
          <button aria-label="autocomplete-action" type="button">
            {selectedItem}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default AutocompleteInputValue;
