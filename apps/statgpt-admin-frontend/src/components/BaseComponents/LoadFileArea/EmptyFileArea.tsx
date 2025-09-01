import classNames from 'classnames';
import { ChangeEvent, FC, KeyboardEvent, useCallback, useRef } from 'react';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import { Button } from '@/src/components/BaseComponents/Button/Button';

interface Props {
  emptyTitle: string;
  acceptTypes: string;
  onChange: (url?: FileList) => void;
}

const EmptyFileArea: FC<Props> = ({ onChange, emptyTitle, acceptTypes }) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        onChange(selectedFiles);
      }
    },
    [onChange],
  );

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(selectedFiles: { files: FileList }) {
        onChange(selectedFiles.files);
      },
      collect: (monitor: DropTargetMonitor) => {
        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        };
      },
    }),
    [onFileChange],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
    if (event.key === 'Enter' || event.key === 'Space') {
      event.preventDefault(); // Prevent scrolling on space press
      fileInputRef.current?.click();
    }
  };

  const containerCssClasses = classNames(
    'border border-dashed rounded',
    'h-[138px] w-full cursor-pointer relative',
    !canDrop && 'border-primary',
    canDrop && (!isOver ? 'border-hover' : 'border-accent-primary'),
  );

  drop(dropRef);

  return (
    <div className={containerCssClasses} ref={dropRef}>
      <label
        htmlFor="file"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="flex flex-col items-center cursor-pointer h-full w-full text-secondary tiny justify-center"
      >
        <p className="mb-1">{emptyTitle}</p>
        <p className="mb-0.5"> Or</p>
        <Button
          cssClass="tertiary"
          title={'Browse'}
          onClick={() => fileInputRef.current?.click()}
        />
      </label>
      <input
        id="file"
        type="file"
        ref={fileInputRef}
        hidden
        accept={acceptTypes}
        onChange={onFileChange}
      />
    </div>
  );
};

export default EmptyFileArea;
