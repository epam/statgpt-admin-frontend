import { FC } from 'react';

import { MonacoEditor } from '@/src/components/Editor/Editor';

interface Props {
  height?: string;
  value?: string;
  language?: string;
  onChangeConfig: (value: string | undefined) => void;
}

export const Configuration: FC<Props> = ({
  onChangeConfig,
  language = 'yaml',
  value,
  height,
}) => {
  return (
    <div
      className="flex flex-col common-paddings border-b border-solid border-b-tertiary"
      style={{ height }}
    >
      <div className="mb-4 small">Configuration</div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          value={value}
          onChange={(value) => onChangeConfig(value)}
          language={language}
        />
      </div>
    </div>
  );
};
