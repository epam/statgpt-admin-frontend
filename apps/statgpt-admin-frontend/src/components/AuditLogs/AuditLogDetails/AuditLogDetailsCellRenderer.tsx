'use client';

import { CustomCellRendererProps } from 'ag-grid-react';
import { IconFileDescription } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { AuditLog } from '@/src/models/audit-log';
import { createPortal } from 'react-dom';
import { AuditLogDetailsView } from './AuditLogDetailsView';

export const AUDIT_LOG_DETAILS_CELL_RENDERER_KEY =
  'AuditLogDetailsCellRenderer';

export const AuditLogDetailsCellRenderer = ({
  data,
}: CustomCellRendererProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openHandler = useCallback(() => setIsOpen(true), []);
  const closeHandler = useCallback(() => setIsOpen(false), []);

  if (!data) return null;

  return (
    <>
      <button
        className="size-full flex items-center justify-center"
        onClick={openHandler}
      >
        <IconFileDescription className="text-secondary size-4" />
      </button>
      {isOpen &&
        createPortal(
          <AuditLogDetailsView data={data as AuditLog} close={closeHandler} />,
          document.body,
        )}
    </>
  );
};
