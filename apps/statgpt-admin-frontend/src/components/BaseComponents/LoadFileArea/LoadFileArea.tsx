import { FC, ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { IconTrashX } from '@tabler/icons-react';

import Field from '@/src/components/BaseComponents/Fields/Field';
import InputWithIcon from '../Input/InputWithIcon';
import EmptyFileArea from './EmptyFileArea';

interface LoadFileAreaProps {
  emptyTitle: string;
  files?: FileList;
  acceptTypes: string;
  iconBeforeInput?: ReactNode;
  onChangeFile: (value?: FileList) => void;
}

interface LoadFileAreaFieldProps extends LoadFileAreaProps {
  fieldTitle: string;
  elementId: string;
}

export const LoadFileArea: FC<LoadFileAreaProps> = ({
  acceptTypes,
  emptyTitle,
  files,
  iconBeforeInput,
  onChangeFile,
}) => {
  const removeFile = () => {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onChangeFile(void 0);
        }}
      >
        <IconTrashX width={18} height={18} />
      </button>
    );
  };

  return files == null ? (
    <DndProvider backend={HTML5Backend}>
      <EmptyFileArea
        onChange={onChangeFile}
        acceptTypes={acceptTypes}
        emptyTitle={emptyTitle}
      />
    </DndProvider>
  ) : (
    <InputWithIcon
      inputId="file"
      value={files[0].name}
      iconAfterInput={removeFile()}
      iconBeforeInput={iconBeforeInput}
      onChangeFile={onChangeFile}
    />
  );
};

export const LoadFileAreaField: FC<LoadFileAreaFieldProps> = ({
  fieldTitle,
  elementId,
  ...props
}) => {
  return (
    <div className="flex flex-col">
      <Field fieldTitle={fieldTitle} htmlFor={elementId} />

      <LoadFileArea {...props} />
    </div>
  );
};

export default LoadFileAreaField;
