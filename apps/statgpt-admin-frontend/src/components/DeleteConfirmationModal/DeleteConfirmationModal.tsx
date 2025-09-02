import { FC } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import { Modal } from '@/src/components/Modal/Modal';

interface Props {
  title: string;
  description: string;
  close: () => void;
  confirm: () => void;
}

export const DeleteConfirmationModal: FC<Props> = ({
  confirm,
  title,
  description,
  close,
}) => {
  return (
    <Modal
      title={title}
      close={close}
      height="149px"
      width="400px"
      cssClassHeader="border-none"
    >
      <></>
      <div className="text-secondary small pl-[24px]">{description}</div>
      <div className="flex flex-row justify-end w-full">
        <Button cssClass="secondary" title="Cancel" onClick={() => close()} />

        <Button
          cssClass="primary ml-3"
          title="Delete"
          onClick={() => confirm()}
        />
      </div>
    </Modal>
  );
};
