import { FloatingTree, useFloatingParentNodeId } from '@floating-ui/react';
import { HTMLProps, forwardRef } from 'react';

import { DropdownMenuComponent, DropdownProps } from './DropdownComponent';

export const Dropdown = forwardRef<
  HTMLDivElement,
  DropdownProps & HTMLProps<HTMLButtonElement>
>(function Dropdown(props, ref) {
  const parentId = useFloatingParentNodeId();
  if (parentId === null) {
    return (
      <FloatingTree>
        <DropdownMenuComponent {...props} ref={ref} />
      </FloatingTree>
    );
  }

  return <DropdownMenuComponent {...props} ref={ref} />;
});

export default Dropdown;
