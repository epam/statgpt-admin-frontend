'use client';

import { FC, useState } from 'react';

import RemoveDuplicatesIcon from '@/public/icons/remove-duplicates.svg';
import { AlertBanner } from '@/src/components/BaseComponents/AlertBanner/AlertBanner';
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
      <AlertBanner
        action={
          <Button
            cssClass="secondary-light shrink-0 flex items-center"
            title="Remove duplicates"
            icon={<RemoveDuplicatesIcon width={16} height={16} />}
            onClick={() => setConfirmOpen(true)}
          />
        }
      >
        <span className="font-semibold">
          Removal of duplicates is required.
        </span>{' '}
        Deduplication is critical for identifying all occurrences of an entity
        in a data query tool while also optimizing resource usage.
      </AlertBanner>

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
