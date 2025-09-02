import { useId, useRef } from 'react';

import Modal from '@/src/components/Modal/ModalView';
import { PopUpState } from '@/src/types/modal';

interface Props {
  modalState: PopUpState;
  header: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string | null;
  headerClassName?: string;
  onClose: (result: boolean) => void;
}

export const ConfirmDialog = ({
  header,
  headerClassName,
  description,
  confirmLabel,
  cancelLabel,
  modalState,
  onClose,
}: Props) => {
  const confirmLabelRef = useRef<HTMLButtonElement>(null);

  const descriptionId = useId();

  return (
    <Modal
      portalId="theme-main"
      state={modalState}
      onClose={() => onClose(false)}
      containerClassName="inline-block w-full min-w-[90%] px-3 py-4 md:p-6 text-center md:min-w-[300px] md:max-w-[500px]"
      dismissProps={{ outsidePressEvent: 'mousedown' }}
      hideClose
      header={header}
      headerClassName={headerClassName}
    >
      <div className="flex flex-col justify-between gap-4">
        <div className="flex w-full flex-col gap-2 text-start">
          <div>
            {description && (
              <p
                id={descriptionId}
                data-qa="confirm-message"
                className="whitespace-pre-wrap text-secondary"
              >
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-3">
          {cancelLabel && (
            <button className="secondary" onClick={() => onClose(false)}>
              {cancelLabel}
            </button>
          )}
          <button
            ref={confirmLabelRef}
            autoFocus
            className="primary"
            onClick={() => onClose(true)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
