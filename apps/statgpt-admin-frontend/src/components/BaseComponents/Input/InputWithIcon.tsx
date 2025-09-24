'use client';

import { ChangeEvent, FC, ReactNode, useCallback, useRef } from 'react';
import classNames from 'classnames';

import Input, { InputProps } from './Input';

interface Props extends InputProps {
  iconAfterInput?: ReactNode;
  iconBeforeInput?: ReactNode;
  onChangeFile: (file: FileList) => void;
}

export const InputWithIcon: FC<Props> = ({
  iconBeforeInput,
  iconAfterInput,
  cssClass,
  onChangeFile,
  ...props
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        onChangeFile(selectedFiles);
      }
    },
    [onChangeFile],
  );

  return (
    <div
      className={classNames(
        'border border-solid border-primary rounded flex flex-row items-center p-0 hover:border-hover',
        iconAfterInput ? 'pr-2' : '',
        iconBeforeInput ? 'pl-2' : '',
        props.disabled ? 'bg-layer-3 text-secondary' : '',
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      {iconBeforeInput}
      <Input
        cssClass={classNames('border-0 bg-transparent outline-0', cssClass)}
        {...props}
      />
      {iconAfterInput}
      <input
        id="file"
        type="file"
        ref={fileInputRef}
        hidden
        onChange={onFileChange}
      />
    </div>
  );
};
export default InputWithIcon;
