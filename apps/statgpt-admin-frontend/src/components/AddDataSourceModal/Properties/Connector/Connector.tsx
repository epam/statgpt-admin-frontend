import { FC, useEffect, useState } from 'react';

import { DataSourceType } from '@/src/models/data-source';
import { DataSourceTypeItem } from './DataSourceType';

interface Props {
  dsTypes: DataSourceType[];
  changeDsType: (type: number) => void;
}

export const Connector: FC<Props> = ({ dsTypes, changeDsType }) => {
  const [activeType, setActiveType] = useState<number | undefined>(void 0);

  useEffect(() => {
    if (activeType) {
      changeDsType(activeType);
    }
  }, [activeType]);

  useEffect(() => {
    if (dsTypes.length > 0) {
      setActiveType(dsTypes[0].id);
    }
  }, [dsTypes]);

  return (
    <div className="lex-1 min-h-0 flex flex-col common-paddings border-b border-solid border-b-tertiary">
      <div className="mb-3 small">Connector</div>
      <div className="flex flex-row gap-3">
        {dsTypes.map((type, i) => (
          <DataSourceTypeItem
            type={type}
            key={i}
            onClick={() => setActiveType(type.id)}
            isActive={activeType === type.id}
          />
        ))}
      </div>
    </div>
  );
};
