import { FC, useCallback } from 'react';
import { IconTrashX } from '@tabler/icons-react';

import Download from '@/public/icons/download.svg';
import Terms from '@/public/icons/glossary.svg';
import Edit from '@/public/icons/edit.svg';
import Replay from '@/public/icons/replay.svg';
import { EntityOperation } from '@/src/constants/columns/action';
import styles from '../action-column.module.scss';

interface Props {
  item: EntityOperation;
}

export const ActionItem: FC<Props> = ({ item }) => {
  const getIcon = useCallback(() => {
    if (item === EntityOperation.Configure) {
      return <Edit />;
    }

    if (item === EntityOperation.RecalculateIndex) {
      return <Replay />;
    }

    if (item === EntityOperation.Export) {
      return <Download />;
    }

    if (item === EntityOperation.Terms) {
      return <Terms />;
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
