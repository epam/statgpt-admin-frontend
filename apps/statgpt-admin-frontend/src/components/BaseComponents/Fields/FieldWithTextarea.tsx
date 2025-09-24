import { FC } from 'react';

import { Textarea } from '@/src/components/BaseComponents/Textarea/Textarea';
import Field from '@/src/components/BaseComponents/Fields/Field';

interface Props {
  title: string;
  required?: boolean;
  cssClassName?: string;
  inputValue?: string | number;
  inputPlaceholder: string;
  onChange: (value: string | number) => void;
}

export const FieldWithTextarea: FC<Props> = ({
  title,
  inputValue,
  inputPlaceholder,
  cssClassName,
  onChange,
  required,
}) => {
  return (
    <div
      className={`flex flex-col mb-2 tiny text-secondary ${cssClassName != null ? cssClassName : ''}`}
    >
      <Field htmlFor={title} fieldTitle={title} optional={!required} />

      <Textarea
        value={inputValue}
        placeholder={inputPlaceholder}
        onChange={(v) => onChange(v)}
      />
    </div>
  );
};
