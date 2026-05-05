import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { parse, stringify } from 'yaml';

import { getDataSources } from '@/src/app/data-sources/actions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { Configuration } from '@/src/components/Configuration/Configuration';
import { Modal } from '@/src/components/Modal/Modal';
import { Stepper } from '@/src/components/Stepper/Stepper';
import { BaseStep, DatasetStep } from '@/src/constants/steps';
import { useNotification } from '@/src/context/NotificationContext';
import { DataSet } from '@/src/models/data-sets';
import { NotificationType } from '@/src/models/notification';
import { DataSource } from '@/src/models/data-source';
import { RequestData } from '@/src/models/request-data';
import { sendPostRequest } from '@/src/server/api';
import { Step } from '@/src/models/step';
import { ModalsButtons } from './Buttons/ModalsButtons';
import { DataSetStep } from './DataSetStep/DataSetStep';
import { DataSourceStep } from './DataSourceStep/DataSourceStep';

interface Props {
  close: () => void;
}

export const AddDataSetModal: FC<Props> = ({ close }) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const dataSetSteps: Step[] = [
    {
      key: DatasetStep.DataSource,
      isCompleted: () => !!newDataSet?.data_source_id,
    },
    {
      key: DatasetStep.DataSet,
      isCompleted: () => !!newDataSet?.title,
    },
    { key: BaseStep.Configuration },
  ];

  const [newDataSet, setDataSet] = useState<DataSet>({
    details: void 0,
  });
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoadingData, setIsLoadingDs] = useState(false);

  const [activeStep, setActiveStep] = useState(dataSetSteps[0].key);

  useEffect(() => {
    if (dataSources.length === 0 && !isLoadingData) {
      setIsLoadingDs(true);
      getDataSources().then((data) => {
        setIsLoadingDs(false);
        setDataSources((data as RequestData<DataSource>).data);
      });
    }
  }, [dataSources, isLoadingData]);

  const createDataset = () => {
    setIsLoadingDs(true);
    sendPostRequest<DataSet, { ok: boolean; res: DataSet | string }>(
      '/api/v1/datasets',
      newDataSet,
    ).then((res) => {
      setIsLoadingDs(false);
      if (res?.ok) {
        router.refresh();
        close();
        return;
      }

      const message =
        typeof res?.res === 'string'
          ? res.res
          : 'Failed to create dataset. Please check required fields.';

      showNotification({
        type: NotificationType.error,
        title: 'Dataset Creation Failed',
        description: message,
      });
    });
  };

  const getModalContent = () => {
    if (isLoadingData) {
      return (
        <div className="flex items-center w-full justify-center h-[633px]">
          <Loader />
        </div>
      );
    }
    if (activeStep === DatasetStep.DataSource) {
      return (
        <DataSourceStep
          data={dataSources}
          selectDs={(id) =>
            setDataSet({
              ...(newDataSet || {}),
              data_source_id: id,
            } as DataSet)
          }
        />
      );
    }

    if (activeStep === DatasetStep.DataSet) {
      return (
        <DataSetStep
          selectedDataSourceId={newDataSet?.data_source_id}
          changeDataSet={({ title, details }) =>
            setDataSet({
              ...(newDataSet || {}),
              title,
              details,
            } as DataSet)
          }
        />
      );
    }

    if (activeStep === BaseStep.Configuration) {
      return (
        <Configuration
          height="633px"
          value={stringify(newDataSet.details)}
          onChangeConfig={(v) =>
            setDataSet({
              ...(newDataSet || {}),
              details: parse(v || ''),
            } as DataSet)
          }
        />
      );
    }
  };

  return (
    <Modal title="Add Dataset" close={close}>
      <>
        {!isLoadingData && (
          <Stepper
            activeStep={activeStep}
            steps={dataSetSteps}
            onChangeActiveStep={(step) => setActiveStep(step)}
          />
        )}
      </>
      <>{getModalContent()}</>

      <ModalsButtons
        create={createDataset}
        close={close}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        isValidDataSourceStep={!newDataSet?.data_source_id}
        isValidDataSetStep={!newDataSet?.details || !newDataSet?.title}
      />
    </Modal>
  );
};
