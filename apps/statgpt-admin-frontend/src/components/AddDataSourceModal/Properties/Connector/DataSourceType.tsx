import { FC } from 'react';

import Sdmx from '@/public/icons/sdmx.svg';
import { DataSourceType } from '@/src/models/data-source';

interface Props {
  type: DataSourceType;
  isActive: boolean;
  onClick: () => void;
}

export const DataSourceTypeItem: FC<Props> = ({ type, isActive, onClick }) => {
  return (
    <div
      className={`tiny border border-solid p-3 rounded border-primary flex-1 max-w-[310px] hover:cursor-pointer ${isActive ? 'border-accent-primary' : ''}`}
      onClick={() => onClick()}
    >
      <div className="flex flex-row w-full items-center">
        <Sdmx />
        <span className="ml-2">{type.name}</span>
      </div>
      <div className="text-secondary">{type.description}</div>
    </div>
  );
};
