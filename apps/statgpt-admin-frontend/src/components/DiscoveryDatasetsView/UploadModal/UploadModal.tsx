'use client';

import { FC, useState } from 'react';

import { AlertBanner } from '@/src/components/BaseComponents/AlertBanner/AlertBanner';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import LoaderSmall from '@/src/components/BaseComponents/Loader/Loader';
import Switch from '@/src/components/BaseComponents/Switch/Switch';
import { Modal } from '@/src/components/Modal/Modal';
import {
  DiscoveryPayloadErrorDetail,
  DiscoveryPayloadErrorResponse,
  DiscoveryPayloadProblem,
  DiscoveryUploadMode,
  DiscoveryUploadSummary,
} from '@/src/models/discovery-dataset';
import { sendPostRequest } from '@/src/server/api';
import { mergeClasses } from '@/src/utils/mergeClasses';

import { getFileListHeight, UploadFileField } from './UploadFileField';

type Step = 'select' | 'uploading' | 'success';

const FILE_ERROR_ID = 'upload-file-error';

/**
 * Modal height while no file is chosen, sized to the drop area.
 */
const EMPTY_MODAL_HEIGHT = 340;

/**
 * Modal height in px without the file list: header, footer, and the rest of the tallest
 * regular step (delete toggle plus its warning, or the success summary). The modal adds
 * the file list height on top, so it grows with the files up to a cap and then stays put,
 * and does not resize between steps. Taller content, such as a long list of upload
 * problems, scrolls inside the body.
 */
const MODAL_BASE_HEIGHT = 320;

/**
 * Extra modal height in px while an upload error is shown. The file list and the
 * problem list shrink and scroll inside the modal, and this keeps both readable.
 */
const ERROR_EXTRA_HEIGHT = 120;

/**
 * Height of the modal for the current selection and upload outcome.
 * @param fileCount - number of selected files
 * @param hasError - whether the last upload was rejected, which adds room for its error
 */
const getModalHeight = (fileCount: number, hasError: boolean): string => {
  if (fileCount === 0) return `${EMPTY_MODAL_HEIGHT}px`;

  const errorExtra = hasError ? ERROR_EXTRA_HEIGHT : 0;
  return `${MODAL_BASE_HEIGHT + getFileListHeight(fileCount) + errorExtra}px`;
};

interface Props {
  channelId: string;
  close: () => void;
  onUploaded: () => void;
}

const SUMMARY_LABELS: {
  key: Exclude<keyof DiscoveryUploadSummary, 'files'>;
  label: string;
}[] = [
  { key: 'created', label: 'Created' },
  { key: 'updated', label: 'Updated' },
  { key: 'unchanged', label: 'Unchanged' },
  { key: 'deleted', label: 'Deleted' },
  { key: 'rowsRead', label: 'Rows Read' },
];

/**
 * Formats one rejected-upload problem as a single line, prefixed with its
 * location (file, row or item, field, cell) when the backend reports one.
 * @param problem - problem reported by the backend
 */
const formatProblem = (problem: DiscoveryPayloadProblem): string => {
  const location = [
    problem.file,
    problem.row != null
      ? `Row ${problem.row}`
      : problem.index != null
        ? `Item ${problem.index}`
        : undefined,
    problem.field,
    problem.cell,
  ]
    .filter(Boolean)
    .join(', ');

  return location ? `${location}: ${problem.message}` : problem.message;
};

export const UploadModal: FC<Props> = ({ channelId, close, onUploaded }) => {
  const [step, setStep] = useState<Step>('select');
  const [files, setFiles] = useState<File[]>([]);
  const [deleteAbsent, setDeleteAbsent] = useState(false);
  const [summary, setSummary] = useState<DiscoveryUploadSummary | undefined>(
    void 0,
  );
  const [fileError, setFileError] = useState<
    DiscoveryPayloadErrorDetail | undefined
  >(void 0);

  const upload = async () => {
    if (files.length === 0) return;
    setStep('uploading');

    const mode = deleteAbsent
      ? DiscoveryUploadMode.Replace
      : DiscoveryUploadMode.Upsert;
    const formData = new FormData();
    files.forEach((file) => formData.append('file', file, file.name));

    const result = await sendPostRequest<FormData, DiscoveryUploadSummary>(
      `/api/v1/channels/${channelId}/discovery-datasets/upload?mode=${mode}`,
      formData,
    );

    if (result.ok) {
      setSummary(result.data);
      setStep('success');
      return;
    }

    const detail = (
      result.error.raw as DiscoveryPayloadErrorResponse | undefined
    )?.detail;
    setFileError({
      message: detail?.message ?? result.error.message,
      problems: detail?.problems ?? [],
      truncated: detail?.truncated ?? false,
    });
    setDeleteAbsent(false);
    setStep('select');
  };

  const finish = () => {
    onUploaded();
    close();
  };

  const resetOutcome = () => {
    setFileError(void 0);
    setDeleteAbsent(false);
  };

  const handleAddFiles = (added: File[]) => {
    setFiles((current) => [...current, ...added]);
    resetOutcome();
  };

  const handleRemoveFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
    resetOutcome();
  };

  const hasError = fileError != null;
  const isUploading = step === 'uploading';

  return (
    <Modal
      title="Upload Grade C Dataset"
      close={close}
      width="600px"
      height={getModalHeight(files.length, hasError)}
    >
      <></>

      <div className="relative flex h-full flex-col gap-y-4 min-h-[200px] px-6 pt-4 pb-4">
        {(step === 'select' || isUploading) && (
          <div
            className={mergeClasses(
              'flex min-h-0 flex-1 flex-col gap-y-4',
              isUploading && 'invisible',
            )}
            aria-hidden={isUploading}
            inert={isUploading}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-y-1">
              <UploadFileField
                files={files}
                acceptTypes=".csv,.xlsx"
                invalid={hasError}
                errorId={FILE_ERROR_ID}
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFile}
              />

              {fileError && (
                <div
                  id={FILE_ERROR_ID}
                  className="flex min-h-[60px] flex-1 flex-col gap-y-2"
                >
                  <p className="small text-error">{fileError.message}</p>
                  {fileError.problems.length > 0 && (
                    <div className="flex min-h-0 flex-1 flex-col gap-y-2 overflow-auto">
                      {fileError.problems.map((problem, i) => (
                        <p
                          key={i}
                          className="small text-error border-l-2 border-solid border-l-error pl-3"
                        >
                          {formatProblem(problem)}
                        </p>
                      ))}
                    </div>
                  )}
                  {fileError.truncated && (
                    <p className="small text-secondary">
                      Only the first {fileError.problems.length} problems are
                      shown.
                    </p>
                  )}
                </div>
              )}
            </div>

            {files.length > 0 && (
              <div className="shrink-0">
                <Switch
                  isOn={deleteAbsent}
                  disabled={hasError}
                  title="Delete records not in the uploaded files"
                  switchId="upload-delete-absent"
                  onChange={setDeleteAbsent}
                />
              </div>
            )}

            {files.length > 0 && !hasError && (
              <div
                className={mergeClasses(
                  'shrink-0',
                  !deleteAbsent && 'invisible',
                )}
                aria-hidden={!deleteAbsent}
              >
                <AlertBanner className="my-0">
                  Records in the channel that are not in any of the uploaded
                  files will be permanently deleted.
                </AlertBanner>
              </div>
            )}
          </div>
        )}

        {isUploading && (
          <div
            role="status"
            aria-label="Uploading"
            className="absolute inset-0 flex items-center justify-center"
          >
            <LoaderSmall size={32} />
          </div>
        )}

        {step === 'success' && summary && (
          <div className="flex flex-col gap-y-2">
            <p className="text-sm text-primary">
              Upload completed successfully.
            </p>
            <table className="w-full text-sm">
              <tbody>
                {SUMMARY_LABELS.map(({ key, label }) => (
                  <tr key={key} className="border-b border-primary">
                    <td className="py-1 text-secondary">{label}</td>
                    <td className="py-1 text-primary text-right">
                      {summary[key]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(summary.files?.length ?? 0) > 1 && (
              <div className="flex flex-col gap-y-1">
                <p className="tiny text-secondary">Rows read per file</p>
                <div className="max-h-[56px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {summary.files.map(({ file, rowsRead }, i) => (
                        <tr
                          key={`${file}-${i}`}
                          className="border-b border-primary"
                        >
                          <td
                            className="py-1 text-secondary truncate"
                            title={file}
                          >
                            {file}
                          </td>
                          <td className="py-1 text-primary text-right">
                            {rowsRead}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-row justify-end">
        {(step === 'select' || isUploading) && (
          <>
            <Button
              cssClass="secondary mr-3"
              title="Cancel"
              disable={isUploading}
              onClick={close}
            />
            <Button
              cssClass="primary"
              title="Upload"
              disable={files.length === 0 || hasError || isUploading}
              onClick={upload}
            />
          </>
        )}

        {step === 'success' && (
          <Button cssClass="primary" title="Done" onClick={finish} />
        )}
      </div>
    </Modal>
  );
};
