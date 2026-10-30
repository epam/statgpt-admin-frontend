'use client';

import { useState } from 'react';

import Checkbox from '@/src/components/BaseComponents/Checkbox/Checkbox';
import { ConfirmDialog } from '@/src/components/BaseComponents/ConfirmDialog/ConfirmDialog';
import { DiscoveryIndexingStage } from '@/src/models/discovery-dataset';
import { PopUpState } from '@/src/types/modal';

interface Props {
  modalState: PopUpState;
  onClose: (result: {
    confirmed: boolean;
    force: DiscoveryIndexingStage[];
  }) => void;
}

const FORCE_OPTIONS: {
  stage: DiscoveryIndexingStage;
  id: string;
  label: string;
  hint: string;
}[] = [
  {
    stage: DiscoveryIndexingStage.Summarization,
    id: 'reindex-force-summarization',
    label: 'Re-summarize indicators',
    hint: "Re-summarizes every valid record's indicator list, even if the list and the configuration haven't changed. A record whose summary comes out different is then republished.",
  },
  {
    stage: DiscoveryIndexingStage.Publishing,
    id: 'reindex-force-publishing',
    label: 'Republish documents',
    hint: 'Republishes every valid record from scratch, even if unchanged.',
  },
];

export const ReindexConfirmDialog = ({ modalState, onClose }: Props) => {
  const [force, setForce] = useState<DiscoveryIndexingStage[]>([]);
  const [prevModalState, setPrevModalState] = useState(modalState);

  if (modalState !== prevModalState) {
    setPrevModalState(modalState);
    if (modalState === PopUpState.Opened) {
      setForce([]);
    }
  }

  const toggleStage = (stage: DiscoveryIndexingStage, checked: boolean) =>
    setForce((current) =>
      checked
        ? [...current.filter((item) => item !== stage), stage]
        : current.filter((item) => item !== stage),
    );

  return (
    <ConfirmDialog
      modalState={modalState}
      header="Confirm Grade C datasets reindexing"
      description="Reindexing will re-validate all Grade C dataset records, summarize long indicator lists with an LLM and republish them to the knowledge base. This may be time-consuming and uses LLM tokens."
      confirmLabel="Reindex"
      cancelLabel="Cancel"
      onClose={(confirmed) => onClose({ confirmed, force })}
    >
      <div className="flex flex-col gap-4">
        {FORCE_OPTIONS.map(({ stage, id, label, hint }) => (
          <div key={stage} className="flex flex-col gap-2">
            <Checkbox
              id={id}
              label={label}
              checked={force.includes(stage)}
              onChange={(value) => toggleStage(stage, !!value)}
            />
            <p className="whitespace-pre-wrap text-sm text-secondary">{hint}</p>
          </div>
        ))}
      </div>
    </ConfirmDialog>
  );
};
