'use client';

import { FC } from 'react';

import Field from '@/src/components/BaseComponents/Fields/Field';
import { Dropdown } from './Dropdown';
import { DropdownItemsModel, InputFieldBaseProps } from './dropdown.model';
import { DropdownProps } from './DropdownComponent';
import { DropdownMenuItem } from './DropdownItem';

interface Props
  extends InputFieldBaseProps,
    Omit<DropdownProps, 'selectedValue'> {
  items: DropdownItemsModel[];
  selectedValue?: string;
  onChange: (value: string) => void;
}

const DropdownField: FC<Props> = ({
  fieldTitle,
  optional,
  elementId,
  items,
  onChange,
  selectedValue,
  ...props
}) => {
  return (
    <div className="flex flex-col w-full">
      <Field fieldTitle={fieldTitle} optional={optional} htmlFor={elementId} />
      <Dropdown
        {...props}
        selectedValue={items.find((item) => item.id === selectedValue)}
      >
        {items.map((item, i) => (
          <DropdownMenuItem
            key={i}
            item={item.content}
            dropdownItem={item}
            onClick={() => onChange(item.id)}
          />
        ))}
      </Dropdown>
    </div>
  );
};

export default DropdownField;
