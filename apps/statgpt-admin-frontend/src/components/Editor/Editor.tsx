import Editor from '@monaco-editor/react';
import { FC } from 'react';

interface Props {
  value?: string;
  language: string;
  onChange: (value: string | undefined) => void;
}
export const MonacoEditor: FC<Props> = ({ value, onChange, language }) => {
  return (
    <Editor
      language={language}
      value={value || ''}
      onChange={(v) => onChange(v)}
      theme="vs-dark"
    />
  );
};
