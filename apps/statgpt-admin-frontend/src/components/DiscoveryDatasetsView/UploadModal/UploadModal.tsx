'use client';

import { FC, useState } from 'react';

import { AlertBanner } from '@/src/components/BaseComponents/AlertBanner/AlertBanner';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { LoadFileAreaField } from '@/src/components/BaseComponents/LoadFileArea/LoadFileArea';
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

type Step = 'select' | 'uploading' | 'success';

interface Props {
  channelId: string;
  close: () => void;
  onUploaded: () => void;
}

const SUMMARY_LABELS: { key: keyof DiscoveryUploadSummary; label: string }[] = [
  { key: 'created', label: 'Created' },
  { key: 'updated', label: 'Updated' },
  { key: 'unchanged', label: 'Unchanged' },
  { key: 'deleted', label: 'Deleted' },
  { key: 'rowsRead', label: 'Rows Read' },
];

/**
 * Formats one rejected-upload problem as a single line, prefixed with its
 * location (row or item, field, cell) when the backend reports one.
 * @param problem - problem reported by the backend
 */
const formatProblem = (problem: DiscoveryPayloadProblem): string => {
  const location = [
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
  const [files, setFiles] = useState<FileList | undefined>(void 0);
  const [deleteAbsent, setDeleteAbsent] = useState(false);
  const [summary, setSummary] = useState<DiscoveryUploadSummary | undefined>(
    void 0,
  );
  const [fileError, setFileError] = useState<
    DiscoveryPayloadErrorDetail | undefined
  >(void 0);

  const upload = async () => {
    if (!files) return;
    setStep('uploading');

    const mode = deleteAbsent
      ? DiscoveryUploadMode.Replace
      : DiscoveryUploadMode.Upsert;
    const formData = new FormData();
    formData.append('file', files[0], files[0].name);

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
    setStep('select');
  };

  const finish = () => {
    onUploaded();
    close();
  };

  const handleFilesChange = (newFiles: FileList | undefined) => {
    setFiles(newFiles);
    setFileError(void 0);
    if (!newFiles) setDeleteAbsent(false);
  };

  const hasError = fileError != null;

  return (
    <Modal title="Upload Grade C Dataset" close={close} width="600px">
      <></>

      <div className="flex flex-col gap-y-4 min-h-[200px] px-6 pt-4 pb-4">
        {step === 'select' && (
          <>
            <div className="flex flex-col gap-y-1">
              <LoadFileAreaField
                elementId="file"
                fieldTitle="File"
                acceptTypes=".csv,.xlsx"
                emptyTitle="Drop file here"
                files={files}
                onChangeFile={handleFilesChange}
                labelClassName="text-sm"
                inputClassName="text-sm"
              />

              {fileError && (
                <div className="flex flex-col gap-y-2">
                  <p className="small text-error">{fileError.message}</p>
                  {fileError.problems.length > 0 && (
                    <div className="flex flex-col gap-y-2 overflow-auto max-h-[200px]">
                      {fileError.problems.map((problem, i) => (
                        <p key={i} className="small text-error">
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

            {files && (
              <Switch
                isOn={deleteAbsent}
                disabled={hasError}
                title="Delete records not in this file"
                switchId="upload-delete-absent"
                onChange={setDeleteAbsent}
              />
            )}

            {files && !hasError && (
              <div
                className={deleteAbsent ? undefined : 'invisible'}
                aria-hidden={!deleteAbsent}
              >
                <AlertBanner className="my-0">
                  Records in the channel that are not in the uploaded file will
                  be permanently deleted.
                </AlertBanner>
              </div>
            )}
          </>
        )}

        {step === 'uploading' && (
          <LoaderSmall size={32} containerClassName="h-[150px]" />
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
          </div>
        )}
      </div>

      <div className="flex flex-row justify-end">
        {step === 'select' && (
          <>
            <Button cssClass="secondary mr-3" title="Cancel" onClick={close} />
            <Button
              cssClass="primary"
              title="Upload"
              disable={files == null || hasError}
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
