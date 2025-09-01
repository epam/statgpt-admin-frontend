import { FC } from 'react';

interface Props {
  value?: string | number;
  placeholder: string;
  onChange: (value: string | number) => void;
}

export const Input: FC<Props> = ({ value, placeholder, onChange }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
};
