import { useFloatingTree, useListItem, useMergeRefs } from '@floating-ui/react';
import classNames from 'classnames';
import {
  ButtonHTMLAttributes,
  FocusEvent,
  forwardRef,
  MouseEvent,
  ReactNode,
  useContext,
} from 'react';

import { MenuContext } from './DropdownComponent';
import { menuItemClassNames } from './dropdown-css';
import { DropdownItemsModel } from './dropdown.model';

interface DropdownMenuItemProps {
  dropdownItem?: DropdownItemsModel;
  item?: ReactNode;
  disabled?: boolean;
}

export const DropdownMenuItem = forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function DropdownMenuItem(
  { className, dropdownItem, item: ItemComponent, disabled, ...props },
  forwardedRef,
) {
  const menu = useContext(MenuContext);
  const item = useListItem({ label: disabled ? null : dropdownItem?.id });
  const tree = useFloatingTree();
  const isActive = item.index === menu.activeIndex;

  return (
    <div className={dropdownItem?.sectionStart ? 'pt-1' : ''}>
      <button
        {...props}
        ref={useMergeRefs([item.ref, forwardedRef])}
        type="button"
        role="menuitem"
        className={classNames(
          menuItemClassNames,
          'h-[34px] w-full px-3',
          disabled && '!cursor-not-allowed',
          className,
        )}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        {...menu.getItemProps({
          onClick(event: MouseEvent<HTMLButtonElement>) {
            props.onClick?.(event);
            tree?.events.emit('click');
          },
          onFocus(event: FocusEvent<HTMLButtonElement>) {
            props.onFocus?.(event);
            menu.setHasFocusInside(true);
          },
        })}
      >
        {ItemComponent}
        {!ItemComponent && dropdownItem && (
          <span className="inline-block truncate small">
            {dropdownItem.name}
          </span>
        )}
      </button>
      {dropdownItem?.sectionEnd && (
        <div className="w-full border border-primary my-1"></div>
      )}
    </div>
  );
});
