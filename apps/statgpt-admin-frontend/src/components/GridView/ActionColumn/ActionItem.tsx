import { FC, useCallback } from 'react';
import {
  IconDownload,
  IconList,
  IconPencilMinus,
  IconRefreshDot,
  IconTrashX,
} from '@tabler/icons-react';
import Terms from '@/public/icons/glossary.svg';
import { EntityOperation } from '@/src/constants/columns/action';

interface Props {
  item: EntityOperation;
}

export const ActionItem: FC<Props> = ({ item }) => {
  const getIcon = useCallback(() => {
    if (item === EntityOperation.Configure || item === EntityOperation.Edit) {
      return <IconPencilMinus width={18} height={18} />;
    }

    if (item === EntityOperation.RecalculateIndex) {
      return <IconRefreshDot width={18} height={18} />;
    }

    if (item === EntityOperation.Export) {
      return <IconDownload width={18} height={18} />;
    }

    if (item === EntityOperation.Jobs) {
      return <IconList width={18} height={18} />;
    }

    if (item === EntityOperation.Terms) {
      return <Terms />;
    }

    return <IconTrashX width={18} height={18} />;
  }, [item]);

  return (
    <>
      <div className="flex small items-center w-full cursor-pointer text-secondary">
        {getIcon()}
        <span className="ml-2 text-primary">{item}</span>
      </div>
    </>
  );
};
