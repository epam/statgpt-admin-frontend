import { FC, useCallback, useEffect, useState } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import Checkbox from '@/src/components/BaseComponents/Checkbox/Checkbox';
import Modal from '@/src/components/Modal/ModalView';
import { PopUpState } from '@/src/types/modal';

interface Props {
  initSelectedItems?: string[];
  modalState: PopUpState;
  heading: string;
  allItems?: string[];
  onClose: () => void;
  onSelectItems: (items: string[]) => void;
}

const MultiselectModal: FC<Props> = ({
  initSelectedItems,
  modalState,
  heading,
  allItems,
  onClose,
  onSelectItems,
}) => {
  const [isValid, setIsValid] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(
    initSelectedItems || [],
  );
  const [items, setItems] = useState<string[]>([]);

  const onApply = useCallback(() => {
    onSelectItems([...selectedItems].filter((t) => t !== ''));
    onClose();
  }, [onSelectItems, selectedItems, onClose]);

  const onChangeSelectedItems = useCallback(
    (topic: string, value?: boolean) => {
      if (value) {
        setSelectedItems([...selectedItems, topic]);
      } else {
        setSelectedItems(selectedItems.filter((t) => t !== topic));
      }
    },
    [setSelectedItems, selectedItems],
  );

  useEffect(() => {
    setIsValid(!!items.length);
  }, [items]);

  useEffect(() => {
    if (allItems) {
      setItems(allItems);
    }
  }, [setItems, allItems]);

  return (
    <Modal
      portalId="itemsMultiSelect"
      onClose={onClose}
      header={heading}
      state={modalState}
      overlayClassName="z-[102]"
      containerClassName="flex flex-col w-full max-h-[90%] min-w-[90%] p-6 text-center md:min-w-[300px] md:max-w-[500px]"
    >
      <div className="flex flex-col px-2 py-2 flex-grow flex-1 overflow-hidden">
        <div className="flex flex-col gap-y-2 overflow-y-auto h-full">
          {items.map((item, index) => {
            return (
              <Checkbox
                key={index}
                checked={selectedItems.includes(item)}
                id={index.toString()}
                label={item}
                onChange={(v) => onChangeSelectedItems(item, v)}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-row items-center justify-end gap-2">
        <Button cssClass="secondary" title="Cancel" onClick={onClose} />
        <Button
          cssClass="primary"
          title="Apply"
          onClick={onApply}
          disable={!isValid}
        />
      </div>
    </Modal>
  );
};

export default MultiselectModal;
