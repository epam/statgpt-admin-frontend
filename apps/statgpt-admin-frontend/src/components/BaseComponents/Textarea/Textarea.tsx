import { FC } from 'react';

interface Props {
  value?: string | number;
  placeholder: string;
  onChange: (value: string | number) => void;
}

export const Textarea: FC<Props> = ({ value, placeholder, onChange }) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
};
