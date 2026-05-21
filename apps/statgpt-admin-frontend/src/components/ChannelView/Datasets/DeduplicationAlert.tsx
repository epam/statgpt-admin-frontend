'use client';

import { FC, useState } from 'react';

import AlertTriangleFilledIcon from '@/public/icons/alert-triangle-filled.svg';
import RemoveDuplicatesIcon from '@/public/icons/remove-duplicates.svg';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { ConfirmDialog } from '@/src/components/BaseComponents/ConfirmDialog/ConfirmDialog';
import { PopUpState } from '@/src/types/modal';

interface Props {
  onDeduplicate: () => void;
}

export const DeduplicationAlert: FC<Props> = ({ onDeduplicate }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = (confirmed: boolean) => {
    setConfirmOpen(false);
    if (confirmed) onDeduplicate();
  };

  return (
    <>
      <div className="flex items-center gap-3 py-2.5 px-3 my-4 rounded border border-warning bg-warning">
        <AlertTriangleFilledIcon width={24} height={24} className="shrink-0" />
        <div className="flex-1 text-sm text-primary">
          <span className="font-semibold">
            Removal of duplicates is required.
          </span>{' '}
          Deduplication is critical for identifying all occurrences of an entity
          in a data query tool while also optimizing resource usage.
        </div>
        <Button
          cssClass="secondary-light shrink-0 flex items-center"
          title="Remove duplicates"
          icon={<RemoveDuplicatesIcon width={16} height={16} />}
          onClick={() => setConfirmOpen(true)}
        />
      </div>

      <ConfirmDialog
        modalState={confirmOpen ? PopUpState.Opened : PopUpState.Closed}
        header="Remove duplicates"
        description="Removal of duplicates is required for Non-indicator and Special dimensions. The indicator dimensions will not be removed."
        confirmLabel="Remove duplicates"
        cancelLabel="Cancel"
        onClose={handleConfirm}
      />
    </>
  );
};
