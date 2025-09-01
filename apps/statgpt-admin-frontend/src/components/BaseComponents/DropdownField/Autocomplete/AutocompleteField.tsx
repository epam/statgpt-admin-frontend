'use client';

import { FC } from 'react';

import { InputFieldBaseProps } from '@/src/components/BaseComponents/DropdownField/dropdown.model';
import Field from '@/src/components/BaseComponents/Field/Field';
import DropdownAutocomplete from './DropdownAutocomplete';

interface Props extends InputFieldBaseProps {
  items: string[];
  onChange: (value: string) => void;
}

const AutocompleteField: FC<Props> = ({
  fieldTitle,
  elementId,
  optional,
  onChange,
  ...props
}) => {
  return (
    <div className="flex flex-col">
      <Field fieldTitle={fieldTitle} optional={optional} htmlFor={elementId} />

      <DropdownAutocomplete
        inputId={elementId}
        onSelectItem={onChange}
        {...props}
      />
    </div>
  );
};

export default AutocompleteField;
