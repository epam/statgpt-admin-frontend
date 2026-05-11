'use client';

import { AuditLog, AuditLogDetails } from '@/src/models/audit-log';
import { Modal } from '../../Modal/Modal';
import { DiffEditor } from '@monaco-editor/react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { sendGetRequest } from '@/src/server/api';
import { DataField } from './DataField';
import { CopyButton } from '../../BaseComponents/CopyButton/CopyButton';
import { useApiNotification } from '@/src/hooks/use-api-notification';

export const AuditLogDetailsView = ({
  data,
  close,
}: {
  data: AuditLog;
  close: () => void;
}) => {
  const [details, setDetails] = useState<AuditLogDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const withNotification = useApiNotification();

  useEffect(() => {
    let cancelled = false;

    setDetails(null);
    setError(null);

    startTransition(() => {
      (async () => {
        const result = await withNotification(
          sendGetRequest<AuditLogDetails>(`/api/v1/audit-logs/${data.id}`),
          'Failed to Load Action Details',
        );

        if (!result.ok) {
          if (!cancelled)
            setError(result.error.message || 'Failed to load action details.');
          return;
        }

        if (!cancelled) setDetails(result.data);
      })();
    });

    return () => {
      cancelled = true;
    };
  }, [data.id, withNotification]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' ||
        event.key === 'Esc' ||
        event.keyCode === 27
      ) {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);

    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [close]);

  const original = useMemo(() => {
    return details?.state_before
      ? JSON.stringify(details?.state_before, null, 2)
      : '';
  }, [details?.state_before]);

  const modified = useMemo(
    () =>
      details?.state_after ? JSON.stringify(details?.state_after, null, 2) : '',
    [details?.state_after],
  );

  const showLoader = isPending || (!details && !error);

  return (
    <Modal title="Action Details" close={close}>
      <></>
      <div className="flex flex-col gap-6 mx-6 my-4">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <span className="text-primary heading-3">{data.trace_id}</span>
            <CopyButton
              onClick={() => navigator.clipboard.writeText(data.trace_id ?? '')}
            />
          </div>
          <div className="flex gap-10 overflow-x-scroll">
            <DataField label="Action" value={data.action_type} />
            <DataField label="Entity type" value={data.entity_type} />
            <DataField label="Entity ID" value={data.entity_id} />
            <DataField label="Entity name" value={data.entity_name} />
            <DataField label="Initiated" value={data.performed_by_name} />
            <DataField
              label="Time"
              value={
                data.created_at
                  ? new Date(data.created_at).toLocaleString()
                  : ''
              }
            />
          </div>
        </div>
        <div className="relative">
          {(showLoader || error) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded">
              {error ? (
                <span className="text-sm text-error">{error}</span>
              ) : (
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Loading diff…</span>
                </div>
              )}
            </div>
          )}

          <div className="h-[600px]">
            {details && !error && (
              <DiffEditor
                key={data.id}
                original={original}
                modified={modified}
                loading="Loading diff…"
                language="json"
                keepCurrentOriginalModel
                keepCurrentModifiedModel
                options={{
                  useInlineViewWhenSpaceIsLimited: false,
                  renderSideBySide: true,
                  readOnly: true,
                  automaticLayout: true,
                  wordWrap: 'on',
                  diffWordWrap: 'on',
                  scrollBeyondLastLine: false,
                  renderWhitespace: 'selection',
                  minimap: { enabled: false },
                }}
                theme="vs-dark"
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
