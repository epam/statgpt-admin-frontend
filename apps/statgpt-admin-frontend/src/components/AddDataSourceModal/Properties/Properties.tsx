import { FC } from 'react';

import { DataSource, DataSourceType } from '@/src/models/data-source';
import { Connector } from './Connector/Connector';
import { Details } from './Details/Details';

interface Props {
  dsTypes: DataSourceType[];
  dataSource?: DataSource;
  changeDsDetails: (ds: DataSource) => void;
  changeDsType: (type: number) => void;
}

export const DataSourceProperties: FC<Props> = ({
  changeDsDetails,
  changeDsType,
  dataSource,
  dsTypes,
}) => {
  return (
    <>
      <div className="flex flex-col h-[360px]">
        <Details
          changeDsProperties={(ds) => changeDsDetails(ds)}
          dataSource={dataSource}
        />

        <Connector dsTypes={dsTypes} changeDsType={(t) => changeDsType(t)} />
      </div>
    </>
  );
};
