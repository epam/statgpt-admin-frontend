'use client';

import {
  IconFile,
  IconFileTypeCsv,
  IconFileTypeXls,
} from '@tabler/icons-react';
import { ChangeEvent, FC, useRef } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import { LoadFileArea } from '@/src/components/BaseComponents/LoadFileArea/LoadFileArea';
import { BASE_ICON_PROPS } from '@/src/constants/layout';

const FILE_INPUT_ID = 'file';

interface Props {
  file?: File;
  acceptTypes: string;
  invalid?: boolean;
  errorId?: string;
  onChangeFile: (file?: File) => void;
}

/**
 * Picks the icon for a file by its extension, falling back to a generic file icon.
 * @param name - file name, with or without an extension
 */
const getFileIcon = (name: string) => {
  const extension = name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') return IconFileTypeCsv;
  if (extension === 'xls' || extension === 'xlsx') return IconFileTypeXls;
  return IconFile;
};

/**
 * File field of the Grade C upload modal. Shows the drop area until a file is
 * chosen, then a read-only row with the file name and a "Change file" action
 * that replaces the file without resetting the form.
 * @param file - currently chosen file
 * @param acceptTypes - comma-separated extensions the file picker offers
 * @param invalid - marks the chosen file as rejected for assistive tech; the visible error is rendered by the caller
 * @param errorId - id of the element that describes the error, for assistive tech
 * @param onChangeFile - called with the new file when one is picked or dropped
 */
export const UploadFileField: FC<Props> = ({
  file,
  acceptTypes,
  invalid = false,
  errorId,
  onChangeFile,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) {
      onChangeFile(picked);
    }
    // `input.files` is a live list that the reset below empties, so the File has to be taken out first.
    // The reset itself lets the user re-pick the same file after fixing it on disk, which would otherwise fire no change event.
    e.target.value = '';
  };

  const FileIcon = file ? getFileIcon(file.name) : IconFile;

  return (
    <div className="flex flex-col gap-y-2">
      <label className="tiny text-secondary" htmlFor={FILE_INPUT_ID}>
        File
      </label>

      {file ? (
        <div className="flex flex-row items-center gap-x-3 rounded-xl bg-layer-4 pl-3 pr-3">
          <FileIcon
            {...BASE_ICON_PROPS}
            className="shrink-0 text-icon-primary"
            aria-hidden="true"
          />

          <span
            className="small min-w-0 flex-1 truncate py-[18px] text-primary"
            title={file.name}
          >
            {file.name}
          </span>

          <Button
            cssClass="small-medium shrink-0 whitespace-nowrap rounded px-2 py-2 text-accent-primary hover:bg-controls-accent-alpha focus-visible:bg-controls-accent-alpha"
            title="Change file"
            onClick={() => inputRef.current?.click()}
          />

          <input
            id={FILE_INPUT_ID}
            ref={inputRef}
            type="file"
            hidden
            accept={acceptTypes}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            onChange={handleInputChange}
          />
        </div>
      ) : (
        <LoadFileArea
          emptyTitle="Drop file here"
          acceptTypes={acceptTypes}
          inputClassName="text-sm"
          onChangeFile={(dropped) => onChangeFile(dropped?.[0])}
        />
      )}
    </div>
  );
};
