import { ButtonHTMLAttributes, forwardRef } from 'react';
import { useId, useListItem, useMergeRefs } from '@floating-ui/react';

import { menuItemClassNames } from '@/src/components/BaseComponents/DropdownField/dropdown-css';

interface Props {
  label: string;
  active: boolean;
}

const DropdownAutocompleteItem = forwardRef<
  HTMLButtonElement,
  Props & ButtonHTMLAttributes<HTMLButtonElement>
>(function DropdownAutocompleteItem({ active, label, ...rest }, ref) {
  const id = useId();
  const item = useListItem({ label });

  return (
    <button
      ref={useMergeRefs([item.ref, ref])}
      role="option"
      id={id}
      aria-selected={active}
      {...rest}
      aria-label="dropdown-autocomplete-item"
      className={menuItemClassNames}
      style={{ ...rest.style }}
    >
      {label}
    </button>
  );
});
export default DropdownAutocompleteItem;
