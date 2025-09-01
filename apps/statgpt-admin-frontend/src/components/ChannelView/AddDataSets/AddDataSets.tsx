import { GridOptions } from 'ag-grid-community';
import { FC, useEffect, useState } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import { GridView } from '@/src/components/GridView/GridView';
import { Modal } from '@/src/components/Modal/Modal';
import { BASE_COLUMNS } from '@/src/constants/columns/common-columns';
import { DataSet } from '@/src/models/data-sets';
import { RequestData } from '@/src/models/request-data';
import { sendGetRequest } from '@/src/server/api';
import { DATA_SETS_URL } from '@/src/server/data-sets-api';

interface Props {
  close: () => void;
  add: (selectedDataSetIds: number[]) => void;
}

export const AddDatasets: FC<Props> = ({ close, add }) => {
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [selectedDataSetIds, setSelectedDataSetIds] = useState<number[]>([]);
  const [isLoadingData, setIsLoadingDs] = useState(false);

  const gridOptions: GridOptions = {
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    isRowSelectable: () => true,
    onRowSelected: (event) => {
      setSelectedDataSetIds(
        event.api.getSelectedNodes().map((n) => n.data.id as number),
      );
    },
  };

  useEffect(() => {
    if (dataSets.length === 0 && !isLoadingData) {
      setIsLoadingDs(true);
      sendGetRequest(DATA_SETS_URL).then((data) => {
        setIsLoadingDs(false);
        setDataSets((data as RequestData<DataSet>).data);
      });
    }
  }, []);

  return (
    <Modal title="Add Datasets" close={close} height="880px">
      <></>
      <>
        {!isLoadingData && (
          <div className="h-full pt-0 pb-0 pl-[24px] pr-[24px]">
            <GridView
              colDefs={[
                {
                  width: 40,
                  maxWidth: 40,
                  headerCheckboxSelection: true,
                  checkboxSelection: true,
                  showDisabledCheckboxes: true,
                  pinned: 'left',
                },
                ...BASE_COLUMNS,
              ]}
              data={dataSets}
              additionalOptions={gridOptions}
              emptyDataTitle="No Datasets"
            />
          </div>
        )}
      </>

      <div className="flex flex-row justify-end w-full">
        <Button cssClass="secondary" title="Cancel" onClick={() => close()} />
        <Button
          cssClass="primary ml-3"
          title="Add"
          onClick={() => add(selectedDataSetIds)}
        />
      </div>
    </Modal>
  );
};
