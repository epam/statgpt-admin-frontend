import { FC } from 'react';

import { MonacoEditor } from '@/src/components/Editor/Editor';
import { EntityNameField } from './EntityNameField';

interface Props {
  name: string;
  nameTouched: boolean;
  onNameChange: (value: string) => void;
  config: string;
  onConfigChange: (value: string) => void;
}

export const DatasetConfigForm: FC<Props> = ({
  name,
  nameTouched,
  onNameChange,
  config,
  onConfigChange,
}) => {
  return (
    <div className="flex flex-col gap-4 h-full">
      <EntityNameField
        value={name}
        touched={nameTouched}
        onChange={onNameChange}
      />
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <label className="text-secondary tiny">Configuration</label>
        <div className="flex-1 min-h-0">
          <MonacoEditor
            value={config}
            onChange={(v) => onConfigChange(v || '')}
            language="yaml"
          />
        </div>
      </div>
    </div>
  );
};
