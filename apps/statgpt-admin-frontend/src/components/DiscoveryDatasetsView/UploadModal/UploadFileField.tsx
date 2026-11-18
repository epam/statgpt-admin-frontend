'use client';

import {
  IconFile,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconX,
} from '@tabler/icons-react';
import { ChangeEvent, FC, useRef } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import { LoadFileArea } from '@/src/components/BaseComponents/LoadFileArea/LoadFileArea';
import { BASE_ICON_PROPS } from '@/src/constants/layout';

const FILE_INPUT_ID = 'file';

const FILE_ROW_HEIGHT = 36;
const FILE_ROW_GAP = 4;
export const MAX_VISIBLE_FILE_ROWS = 4;

/**
 * Height in px of the file list showing `rows` rows, capped at the visible maximum;
 * longer lists scroll inside this height.
 * @param rows - number of files in the list
 */
export const getFileListHeight = (rows: number): number => {
  const visible = Math.min(rows, MAX_VISIBLE_FILE_ROWS);
  return visible * FILE_ROW_HEIGHT + Math.max(visible - 1, 0) * FILE_ROW_GAP;
};

interface Props {
  files: File[];
  acceptTypes: string;
  invalid?: boolean;
  errorId?: string;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
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
 * File field of the Grade C upload modal. Shows the drop area until files are
 * chosen, then one read-only row per file with a remove action and an
 * "Add files" action that appends more files without resetting the form.
 * @param files - currently chosen files, in upload order
 * @param acceptTypes - comma-separated extensions the file picker offers
 * @param invalid - marks the chosen files as rejected for assistive tech; the visible error is rendered by the caller
 * @param errorId - id of the element that describes the error, for assistive tech
 * @param onAddFiles - called with the files that were picked or dropped
 * @param onRemoveFile - called with the index of the file whose remove action was used
 */
export const UploadFileField: FC<Props> = ({
  files,
  acceptTypes,
  invalid = false,
  errorId,
  onAddFiles,
  onRemoveFile,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length > 0) {
      onAddFiles(picked);
    }
    // `input.files` is a live list that the reset below empties, so the Files have to be taken out first.
    // The reset itself lets the user re-pick the same file after fixing it on disk, which would otherwise fire no change event.
    e.target.value = '';
  };

  return (
    <div className="flex min-h-0 flex-col gap-y-2">
      <div className="flex shrink-0 flex-row items-center justify-between">
        <label className="tiny text-secondary" htmlFor={FILE_INPUT_ID}>
          Files
        </label>

        {files.length > 0 && (
          <Button
            cssClass="small-medium shrink-0 whitespace-nowrap rounded px-2 py-1 text-accent-primary hover:bg-controls-accent-alpha focus-visible:bg-controls-accent-alpha"
            title="Add files"
            onClick={() => inputRef.current?.click()}
          />
        )}
      </div>

      {files.length > 0 ? (
        <>
          <ul
            className="flex flex-col gap-y-1 overflow-y-auto"
            style={{
              maxHeight: getFileListHeight(MAX_VISIBLE_FILE_ROWS),
              minHeight: getFileListHeight(Math.min(files.length, 2)),
            }}
          >
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file.name);

              return (
                <li
                  key={`${file.name}-${index}`}
                  className="flex h-9 shrink-0 flex-row items-center gap-x-3 rounded-xl bg-layer-4 pl-3 pr-2"
                >
                  <FileIcon
                    {...BASE_ICON_PROPS}
                    className="shrink-0 text-icon-primary"
                    aria-hidden="true"
                  />

                  <span
                    className="small min-w-0 flex-1 truncate text-primary"
                    title={file.name}
                  >
                    {file.name}
                  </span>

                  <button
                    type="button"
                    className="shrink-0 rounded p-1 text-icon-secondary hover:text-icon-accent-primary"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => onRemoveFile(index)}
                  >
                    <IconX {...BASE_ICON_PROPS} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>

          <input
            id={FILE_INPUT_ID}
            ref={inputRef}
            type="file"
            hidden
            multiple
            accept={acceptTypes}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            onChange={handleInputChange}
          />
        </>
      ) : (
        <LoadFileArea
          emptyTitle="Drop files here"
          acceptTypes={acceptTypes}
          inputClassName="text-sm"
          multiple
          onChangeFile={(dropped) => {
            const droppedFiles = Array.from(dropped ?? []);
            if (droppedFiles.length > 0) {
              onAddFiles(droppedFiles);
            }
          }}
        />
      )}
    </div>
  );
};
