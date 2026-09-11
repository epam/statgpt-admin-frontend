'use client';

import { FC, useState } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import { LoadFileAreaField } from '@/src/components/BaseComponents/LoadFileArea/LoadFileArea';
import LoaderSmall from '@/src/components/BaseComponents/Loader/Loader';
import Switch from '@/src/components/BaseComponents/Switch/Switch';
import { Modal } from '@/src/components/Modal/Modal';
import {
  DiscoveryPayloadErrorResponse,
  DiscoveryPayloadProblem,
  DiscoveryUploadMode,
  DiscoveryUploadSummary,
} from '@/src/models/discovery-dataset';
import { sendPostRequest } from '@/src/server/api';

type Step = 'select' | 'confirm' | 'uploading' | 'success' | 'error';

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

export const UploadModal: FC<Props> = ({ channelId, close, onUploaded }) => {
  const [step, setStep] = useState<Step>('select');
  const [files, setFiles] = useState<FileList | undefined>(void 0);
  const [replace, setReplace] = useState(false);
  const [summary, setSummary] = useState<DiscoveryUploadSummary | undefined>(
    void 0,
  );
  const [problems, setProblems] = useState<DiscoveryPayloadProblem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const upload = async () => {
    if (!files) return;
    setStep('uploading');

    const mode = replace
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

  const onUploadClick = (): void => {
    if (replace) {
      setStep('confirm');
    } else {
      upload();
    }
  };

  const finish = () => {
    onUploaded();
    close();
  };

  const handleFilesChange = (newFiles: FileList | undefined) => {
    setFiles(newFiles);
    if (!newFiles) setReplace(false);
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
              <Switch
                isOn={replace}
                title="Replace records not in this file"
                switchId="upload-replace"
                onChange={setReplace}
              />
            )}
          </>
        )}

        {step === 'confirm' && (
          <p className="text-sm text-primary">
            This will permanently delete records present in the channel but
            missing from the uploaded file.
          </p>
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
              onClick={onUploadClick}
            />
          </>
        )}

        {step === 'confirm' && (
          <>
            <Button
              cssClass="secondary mr-3"
              title="Back"
              onClick={() => setStep('select')}
            />
            <Button
              cssClass="primary"
              title="Confirm Upload"
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
