import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { stringify } from 'yaml';

import { getDataSources } from '@/src/app/data-sources/actions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { Configuration } from '@/src/components/Configuration/Configuration';
import { Modal } from '@/src/components/Modal/Modal';
import { Stepper } from '@/src/components/Stepper/Stepper';
import { BaseStep, DatasetStep } from '@/src/constants/steps';
import { DataSet } from '@/src/models/data-sets';
import { DataSource } from '@/src/models/data-source';
import { sendPostRequest } from '@/src/server/api';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { useYamlParser } from '@/src/hooks/use-yaml-parser';
import { Step } from '@/src/models/step';
import { ModalsButtons } from './Buttons/ModalsButtons';
import { DataSetStep } from './DataSetStep/DataSetStep';
import { DataSourceStep } from './DataSourceStep/DataSourceStep';

interface Props {
  close: () => void;
}

export const AddDataSetModal: FC<Props> = ({ close }) => {
  const router = useRouter();
  const withNotification = useApiNotification();
  const parseYaml = useYamlParser();
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
  const [rawConfig, setRawConfig] = useState('');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoadingData, setIsLoadingDs] = useState(false);

  const [activeStep, setActiveStep] = useState(dataSetSteps[0].key);

  useEffect(() => {
    if (dataSources.length === 0 && !isLoadingData) {
      setIsLoadingDs(true);
      withNotification(getDataSources(), 'Failed to Load Data Sources').then(
        (result) => {
          setIsLoadingDs(false);
          if (result.ok) setDataSources(result.data.data);
        },
      );
    }
  }, [dataSources, isLoadingData]);

  const createDataset = () => {
    let details = newDataSet.details;
    if (rawConfig) {
      const parsed = parseYaml(rawConfig);
      if (!parsed.ok) return;
      details = parsed.value;
    }
    setIsLoadingDs(true);
    withNotification(
      sendPostRequest('/api/v1/datasets', { ...newDataSet, details }),
      'Dataset Creation Failed',
    ).then((result) => {
      setIsLoadingDs(false);
      if (result.ok) {
        router.refresh();
        close();
      }
    });
  };

  const getModalContent = () => {
    if (isLoadingData) {
      return (
        <div className="flex items-center w-full justify-center h-full">
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
          changeDataSet={({ title, details }) => {
            setDataSet({ ...(newDataSet || {}), title, details } as DataSet);
            setRawConfig(details ? stringify(details) : '');
          }}
        />
      );
    }

    if (activeStep === BaseStep.Configuration) {
      return (
        <Configuration
          height="100%"
          value={rawConfig}
          onChangeConfig={(v) => setRawConfig(v || '')}
        />
      );
    }
  };

  return (
    <Modal title="Add Dataset" close={close} height="80vh">
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
