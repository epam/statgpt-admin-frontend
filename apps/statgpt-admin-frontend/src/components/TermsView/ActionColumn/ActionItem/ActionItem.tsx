import { FC, useCallback } from 'react';
import { IconTrashX } from '@tabler/icons-react';

import Edit from '@/public/icons/edit.svg';
import { EntityOperation } from '@/src/constants/columns/action';
import styles from '../action-column.module.scss';

interface Props {
  item: EntityOperation;
}

export const ActionItem: FC<Props> = ({ item }) => {
  const getIcon = useCallback(() => {
    if (item === EntityOperation.Edit) {
      return <Edit />;
    }

    return <IconTrashX width={18} height={18} />;
  }, [item]);

  return (
    <>
      <div className={styles.action}>
        {getIcon()}
        <span className="ml-2">{item}</span>
      </div>
    </>
  );
};
