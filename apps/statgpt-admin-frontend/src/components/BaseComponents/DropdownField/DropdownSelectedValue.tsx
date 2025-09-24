import { FC } from 'react';

import classNames from 'classnames';
import { DropdownItemsModel } from './dropdown.model';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface Props {
  selectedValue?: DropdownItemsModel;
  placeholder?: string;
  isOpen?: boolean;
  disabled?: boolean;
  selectedClassName?: string;
  prefix?: string;
  isMenu?: boolean;
  multipleValues?: string[];
  placeholderClass?: string;
  height?: number;
}

export const DropdownSelectedItem: FC<Props> = ({
  selectedValue,
  isOpen,
  placeholder,
  placeholderClass,
  isMenu,
  prefix,
  disabled,
  selectedClassName,
  multipleValues,
  height,
}) => {
  const selectedClassNames =
    selectedClassName ||
    classNames(
      'flex flex-row w-full items-center',
      height ? `h-[${height}px]` : '',
      isMenu
        ? 'small-medium cursor-pointer'
        : `input input-field justify-between ${placeholderClass ? 'border-0' : ''}`,
    );
  const selectedValueClassNames = classNames(
    'truncate flex-1 min-w-0 mr-2',
    isMenu
      ? 'border-b-2 bg-accent-primary-alpha border-b-accent-primary border-b-2 py-[13px]'
      : '',
    disabled ? 'text-secondary' : '',
  );
  const placeholderClassNames = classNames(
    'truncate flex-1 min-w-0 mr-2  pointer-events-none',
    placeholderClass || 'text-secondary',
  );
  return (
    <div className={selectedClassNames}>
      {selectedValue?.name ? (
        selectedValue.selectedContent || (
          <>
            {selectedValue.icon && (
              <span className="mr-2 text-icon-primary">
                {selectedValue.icon}
              </span>
            )}
            <span className={selectedValueClassNames}>
              {prefix}
              {selectedValue?.name}
            </span>
          </>
        )
      ) : multipleValues ? (
        <div className="flex flex-1 truncate">
          {multipleValues.map((v) => {
            return (
              <span
                key={v}
                className="inline-block rounded border border-icon-secondary p-1 mr-1"
              >
                {v}
              </span>
            );
          })}
        </div>
      ) : (
        <span className={placeholderClassNames}> {placeholder}</span>
      )}
      <div
        className={classNames(
          placeholderClass,
          disabled ? 'text-secondary' : '',
        )}
      >
        {isOpen ? (
          <IconChevronUp className="w-4 h-4" />
        ) : (
          <IconChevronDown className="w-4 h-4" />
        )}
      </div>
    </div>
  );
};
