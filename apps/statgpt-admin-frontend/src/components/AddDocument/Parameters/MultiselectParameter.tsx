import Multiselect from '@/src/components/BaseComponents/Multiselect/Multiselect';

interface Props {
  name: string;
  options: string[];
  onChange: (values: string[]) => void;
  selectedValues?: string[];
}

const MultiselectParameter = ({
  name,
  options,
  onChange,
  selectedValues,
}: Props) => {
  return (
    <Multiselect
      elementId={`${name}-multiselect`}
      selectedItems={selectedValues}
      allItems={options}
      heading={name}
      title={name}
      onChangeItems={onChange}
    />
  );
};

export default MultiselectParameter;
