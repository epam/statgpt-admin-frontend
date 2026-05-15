import { FC } from 'react';

import Input from '@/src/components/BaseComponents/Input/Input';

interface Props {
  value: string;
  touched: boolean;
  onChange: (value: string) => void;
}

export const EntityNameField: FC<Props> = ({ value, touched, onChange }) => {
  const isInvalid = touched && value.trim() === '';

  return (
    <div className="flex flex-col gap-2">
      <label className="text-secondary tiny" htmlFor="entity-name">
        Name
      </label>
      <Input
        inputId="entity-name"
        value={value}
        onChange={onChange}
        invalid={isInvalid}
      />
      {isInvalid && <span className="text-error tiny">Name is required</span>}
    </div>
  );
};
