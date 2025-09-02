import { useCallback, useState } from 'react';

import DropdownField from '@/src/components/BaseComponents/DropdownField/DropdownField';

interface Props {
  name: string;
  options: string[];
  onChange: (value: string) => void;
  selectedValue?: string;
}

const DropdownParameter = ({
  name,
  options,
  onChange,
  selectedValue,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const items = options.map((o) => ({ id: o, name: o }));
  const onChangeCb = useCallback(
    (value: string) => {
      onChange(value);
      setIsOpen(false);
    },
    [onChange],
  );

  return (
    <DropdownField
      selectedValue={selectedValue}
      onOpenChange={setIsOpen}
      isMenuOpen={isOpen}
      elementId={`${name}-dropdown`}
      items={items}
      placeholder="Select an option"
      fieldTitle={name}
      onChange={onChangeCb}
      isTriggerEnabled={true}
    />
  );
};

export default DropdownParameter;
