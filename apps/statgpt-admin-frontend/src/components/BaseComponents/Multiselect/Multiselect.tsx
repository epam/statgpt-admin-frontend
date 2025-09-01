import { FC, useCallback, useState } from 'react';

import Field from '@/src/components/BaseComponents/Field/Field';
import InputModal from '@/src/components/BaseComponents/InputModal/InputModal';
import { PopUpState } from '@/src/types/modal';
import MultiselectModal from './MultiselectModal';

interface Props {
  elementId: string;
  title: string;
  selectedItems?: string[];
  heading: string;
  allItems?: string[];
  onChangeItems: (items: string[]) => void;
}

const Multiselect: FC<Props> = ({
  onChangeItems,
  elementId,
  selectedItems,
  title,
  heading,
  allItems,
}) => {
  const [modalState, setIsModalState] = useState(PopUpState.Closed);

  const onOpenModal = useCallback(() => {
    setIsModalState(PopUpState.Opened);
  }, [setIsModalState]);

  const onCloseModal = useCallback(() => {
    setIsModalState(PopUpState.Closed);
  }, [setIsModalState]);

  return (
    <div className="flex flex-col">
      <Field fieldTitle={title} htmlFor={elementId} />
      <InputModal
        modalState={modalState}
        selectedValue={selectedItems}
        onOpenModal={onOpenModal}
      >
        <MultiselectModal
          initSelectedItems={selectedItems}
          onSelectItems={onChangeItems}
          modalState={modalState}
          onClose={onCloseModal}
          heading={heading}
          allItems={allItems}
        />
      </InputModal>
    </div>
  );
};

export default Multiselect;
