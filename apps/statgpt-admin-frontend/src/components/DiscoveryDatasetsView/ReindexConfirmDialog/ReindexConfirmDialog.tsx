'use client';

import { useState } from 'react';

import Checkbox from '@/src/components/BaseComponents/Checkbox/Checkbox';
import { ConfirmDialog } from '@/src/components/BaseComponents/ConfirmDialog/ConfirmDialog';
import { PopUpState } from '@/src/types/modal';

interface Props {
  modalState: PopUpState;
  onClose: (result: { confirmed: boolean; force: boolean }) => void;
}

export const ReindexConfirmDialog = ({ modalState, onClose }: Props) => {
  const [force, setForce] = useState(false);
  const [prevModalState, setPrevModalState] = useState(modalState);

  if (modalState !== prevModalState) {
    setPrevModalState(modalState);
    if (modalState === PopUpState.Opened) {
      setForce(false);
    }
  }

  return (
    <ConfirmDialog
      modalState={modalState}
      header="Confirm discovery datasets reindexing"
      description="Reindexing will re-validate all discovery dataset records and republish them to the knowledge base. This may be time-consuming."
      confirmLabel="Reindex"
      cancelLabel="Cancel"
      onClose={(confirmed) => onClose({ confirmed, force })}
    >
      <div className="flex flex-col gap-2">
        <Checkbox
          id="reindex-force"
          label="Force full reindex"
          checked={force}
          onChange={(value) => setForce(!!value)}
        />
        <p className="whitespace-pre-wrap text-sm text-secondary">
          Force reindex will republish every valid record from scratch, even if
          unchanged.
        </p>
      </div>
    </ConfirmDialog>
  );
};
