import { FC } from 'react';

import Input from '@/src/components/BaseComponents/Input/Input';
import Field from '@/src/components/BaseComponents/Fields/Field';

interface Props {
  title: string;
  inputValue?: string | number;
  required?: boolean;
  inputPlaceholder: string;
  onChange: (value: string | number) => void;
}

export const FieldWithInput: FC<Props> = ({
  title,
  inputValue,
  inputPlaceholder,
  onChange,
  required,
}) => {
  return (
    <div className="flex flex-col mb-2 tiny text-secondary">
      <Field htmlFor={title} fieldTitle={title} optional={!required} />

      <Input
        inputId={title}
        value={inputValue}
        placeholder={inputPlaceholder}
        onChange={(v) => onChange(v)}
      />
    </div>
  );
};
