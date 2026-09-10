'use client';

import { FC, useState } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import Checkbox from '@/src/components/BaseComponents/Checkbox/Checkbox';
import { LoadFileAreaField } from '@/src/components/BaseComponents/LoadFileArea/LoadFileArea';
import LoaderSmall from '@/src/components/BaseComponents/Loader/Loader';
import { Modal } from '@/src/components/Modal/Modal';
import {
  DiscoveryPayloadErrorResponse,
  DiscoveryPayloadProblem,
  DiscoveryUploadMode,
  DiscoveryUploadSummary,
} from '@/src/models/discovery-dataset';
import { sendPostRequest } from '@/src/server/api';

type Step = 'select' | 'uploading' | 'success' | 'error';

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
  { key: 'rowsSkipped', label: 'Rows Skipped' },
];

export const UploadModal: FC<Props> = ({ channelId, close, onUploaded }) => {
  const [step, setStep] = useState<Step>('select');
  const [files, setFiles] = useState<FileList | undefined>(void 0);
  const [deleteAbsent, setDeleteAbsent] = useState(false);
  const [summary, setSummary] = useState<DiscoveryUploadSummary | undefined>(
    void 0,
  );
  const [problems, setProblems] = useState<DiscoveryPayloadProblem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

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
    setProblems(detail?.problems ?? []);
    setErrorMessage(detail?.message ?? result.error.message);
    setStep('error');
  };

  const finish = () => {
    onUploaded();
    close();
  };

  const handleFilesChange = (newFiles: FileList | undefined) => {
    setFiles(newFiles);
    if (!newFiles) setDeleteAbsent(false);
  };

  return (
    <Modal title="Upload Grade C Datasets" close={close} width="600px">
      <></>

      <div className="flex flex-col gap-y-6 min-h-[200px] p-4">
        {step === 'select' && (
          <>
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

            {files && (
              <div className="flex flex-col gap-2">
                <Checkbox
                  id="upload-delete-absent"
                  label="Also delete records not in this file"
                  checked={deleteAbsent}
                  onChange={(value) => setDeleteAbsent(!!value)}
                />
                <p className="whitespace-pre-wrap text-sm text-secondary">
                  Records present in the channel but missing from the uploaded
                  file will be permanently deleted.
                </p>
              </div>
            )}
          </>
        )}

        {step === 'uploading' && <LoaderSmall containerClassName="h-[150px]" />}

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

        {step === 'error' && (
          <div className="flex flex-col gap-y-2">
            <p className="text-sm text-error">{errorMessage}</p>
            {problems.length > 0 && (
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-secondary text-left">
                      <th className="py-1 pr-2">Row</th>
                      <th className="py-1 pr-2">Field</th>
                      <th className="py-1 pr-2">Cell</th>
                      <th className="py-1">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.map((problem, i) => (
                      <tr key={i} className="border-b border-primary">
                        <td className="py-1 pr-2 text-primary">
                          {problem.row ?? problem.index ?? ''}
                        </td>
                        <td className="py-1 pr-2 text-primary">
                          {problem.field ?? ''}
                        </td>
                        <td className="py-1 pr-2 text-primary">
                          {problem.cell ?? ''}
                        </td>
                        <td className="py-1 text-primary">{problem.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
              disable={files == null}
              onClick={upload}
            />
          </>
        )}

        {step === 'error' && (
          <>
            <Button
              cssClass="secondary mr-3"
              title="Back"
              onClick={() => setStep('select')}
            />
            <Button cssClass="primary" title="Close" onClick={close} />
          </>
        )}

        {step === 'success' && (
          <Button cssClass="primary" title="Done" onClick={finish} />
        )}
      </div>
    </Modal>
  );
};
