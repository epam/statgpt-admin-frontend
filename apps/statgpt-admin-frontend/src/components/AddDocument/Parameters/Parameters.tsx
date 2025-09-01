import { FC, useEffect, useState } from 'react';

import AutocompleteField from '@/src/components/BaseComponents/DropdownField/Autocomplete/AutocompleteField';
import { FieldWithInput } from '@/src/components/BaseComponents/Fields/FieldWithInput';
import {
  DocumentMetadataDimension,
  DocumentMetadataProperties,
} from '@/src/models/document';
import {
  getDocumentParamName,
  isMetadataComplete,
} from '@/src/utils/document';
import DropdownParameter from './DropdownParameter';
import MultiselectParameter from './MultiselectParameter';

interface Props {
  properties: DocumentMetadataProperties;
  dimensions: DocumentMetadataDimension[];
  onValuesChange: (values: string) => void;
  onValidChange: (valid: boolean) => void;
}

export const Parameters: FC<Props> = ({
  properties,
  dimensions,
  onValuesChange,
  onValidChange,
}) => {
  const controls = Object.keys(properties);
  const [values, setValues] = useState<Record<string, string | string[]>>({});

  const setValue = (value: string | string[], key: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    onValuesChange(JSON.stringify(values));
    onValidChange(isMetadataComplete(properties, values));
  }, [values, onValuesChange, properties, onValidChange]);

  return (
    <div className="flex flex-col gap-y-3 h-[300px] p-4">
      {controls.map((control) => {
        const dimension = dimensions.find((d) => d.name === control);
        const label = getDocumentParamName(control);
        switch (properties[control].type) {
          case 'string':
            if (dimension?.values == null) {
              return (
                <FieldWithInput
                  key={control}
                  title={label}
                  inputPlaceholder="Enter value"
                  inputValue={(values[control] as string) ?? ''}
                  required={true}
                  onChange={(value) => setValue(value.toString(), control)}
                />
              );
            }
            if (properties[control].format === 'date') {
              return (
                <div>
                  <AutocompleteField
                    key={control}
                    elementId={control + 'autocomplete'}
                    placeholder="Start entering date"
                    fieldTitle={label}
                    items={dimension.values}
                    onChange={(value) => setValue(value, control)}
                    value={values[control] as string}
                  />
                  <div className="tiny mt-1 text-secondary">
                    Date format: YYYY-MM-DD
                  </div>
                </div>
              );
            }
            return (
              <DropdownParameter
                key={control}
                name={label}
                options={dimension.values}
                onChange={(value) => setValue(value, control)}
                selectedValue={values[control] as string}
              />
            );
          case 'array':
            return (
              <MultiselectParameter
                name={label}
                options={dimension?.values?.sort() ?? []}
                onChange={(values) => setValue(values, control)}
                selectedValues={values[control] as string[]}
              />
            );
          default:
            return <div key={control}>{control}</div>;
        }
      })}
    </div>
  );
};
