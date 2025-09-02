import { FC } from 'react';

import { DataSource } from '@/src/models/data-source';
import { FieldWithInput } from '@/src/components/BaseComponents/Fields/FieldWithInput';
import { FieldWithTextarea } from '@/src/components/BaseComponents/Fields/FieldWithTextarea';

interface Props {
  dataSource?: DataSource;
  changeDsProperties: (ds: DataSource) => void;
}

export const Details: FC<Props> = ({ changeDsProperties, dataSource }) => {
  return (
    <div className="lex-1 min-h-0 flex flex-col common-paddings border-b border-solid border-b-tertiary">
      <div className="mb-3 small">Data Source details</div>
      <div className="flex flex-1 flex-col min-h-0">
        <FieldWithInput
          title="Name"
          inputPlaceholder="A name of your Data Source."
          inputValue={dataSource?.title}
          required={true}
          onChange={(title) =>
            changeDsProperties({ ...(dataSource || {}), title } as DataSource)
          }
        />
        <div className="flex-1 min-h-0">
          <FieldWithTextarea
            cssClassName="h-full"
            title="Description"
            inputPlaceholder="A description of your Data Source."
            inputValue={dataSource?.description}
            onChange={(description) =>
              changeDsProperties({
                ...(dataSource || {}),
                description,
              } as DataSource)
            }
          />
        </div>
      </div>
    </div>
  );
};
