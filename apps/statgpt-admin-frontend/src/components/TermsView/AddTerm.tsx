import { FC } from 'react';

import { FieldWithInput } from '@/src/components/BaseComponents/Fields/FieldWithInput';
import { ChannelTerm } from '../../models/channel';
import { FieldWithTextarea } from '../BaseComponents/Fields/FieldWithTextarea';

interface Props {
  term: ChannelTerm;
  onValuesChange: (term: ChannelTerm) => void;
}

export const AddTerm: FC<Props> = ({ onValuesChange, term }) => {
  return (
    <div className="flex flex-col gap-y-3">
      <FieldWithInput
        title={'Term'}
        inputPlaceholder="Enter term"
        inputValue={term.term ?? ''}
        required={true}
        onChange={(value) => onValuesChange({ ...term, term: value as string })}
      />

      <FieldWithTextarea
        title={'Definition'}
        inputPlaceholder="Enter definition"
        inputValue={term.definition ?? ''}
        required={true}
        onChange={(value) =>
          onValuesChange({ ...term, definition: value as string })
        }
      />

      <FieldWithInput
        title={'Source'}
        inputPlaceholder="Enter source"
        inputValue={term.source ?? ''}
        required={true}
        onChange={(value) =>
          onValuesChange({ ...term, source: value as string })
        }
      />

      <FieldWithInput
        title={'Domain'}
        inputPlaceholder="Enter domain"
        inputValue={term.domain ?? ''}
        required={true}
        onChange={(value) =>
          onValuesChange({ ...term, domain: value as string })
        }
      />
    </div>
  );
};
