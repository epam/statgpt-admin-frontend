import { FC } from 'react';

import { Input } from '@/src/components/BaseComponents/Input/Input';

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
      <div className="mb-1 flex items-center">
        {title}
        <div className="ml-1 text-accent-primary">{required ? '*' : null}</div>
      </div>
      <Input
        value={inputValue}
        placeholder={inputPlaceholder}
        onChange={(v) => onChange(v)}
      />
    </div>
  );
};
