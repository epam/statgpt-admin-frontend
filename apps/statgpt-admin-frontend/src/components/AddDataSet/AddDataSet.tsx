import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { stringify } from 'yaml';

import { getDataSources } from '@/src/app/data-sources/actions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { DatasetConfigForm } from '@/src/components/DatasetConfigForm/DatasetConfigForm';
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
import { ProviderStep } from './ProviderStep/ProviderStep';

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
      key: DatasetStep.Provider,
      isCompleted: () => !!selectedProviderId,
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
  const [selectedProviderId, setSelectedProviderId] = useState<
    string | undefined
  >(undefined);
  const [rawConfig, setRawConfig] = useState('');
  const [nameConfigTouched, setNameConfigTouched] = useState(false);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoadingData, setIsLoadingDs] = useState(false);

  const [activeStep, setActiveStep] = useState(dataSetSteps[0].key);

  useEffect(() => {
    setIsLoadingDs(true);
    withNotification(getDataSources(), 'Failed to Load Data Sources').then(
      (result) => {
        setIsLoadingDs(false);
        if (result.ok) setDataSources(result.data.data);
      },
    );
  }, []);

  const createDataset = () => {
    if (!newDataSet?.title?.trim()) {
      setNameConfigTouched(true);
      return;
    }

    let details = newDataSet.details;
    if (rawConfig) {
      const parsed = parseYaml(rawConfig);
      if (!parsed.ok) return;
      details = parsed.value;
    }
    setIsLoadingDs(true);
    withNotification(
      sendPostRequest('/api/v1/datasets', {
        ...newDataSet,
        title: newDataSet.title.trim(),
        details,
      }),
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
          selectedId={newDataSet?.data_source_id}
          selectDataset={(id) =>
            setDataSet({
              ...(newDataSet || {}),
              data_source_id: id,
            } as DataSet)
          }
        />
      );
    }

    if (activeStep === DatasetStep.Provider) {
      return (
        <ProviderStep
          selectedDataSourceId={newDataSet?.data_source_id}
          selectedProviderId={selectedProviderId}
          selectProvider={(id) => setSelectedProviderId(id)}
        />
      );
    }

    if (activeStep === DatasetStep.DataSet) {
      return (
        <DataSetStep
          selectedDataSourceId={newDataSet?.data_source_id}
          selectedProviderId={selectedProviderId}
          selectedTitle={newDataSet?.title}
          changeDataSet={({ title, details }) => {
            setDataSet({ ...(newDataSet || {}), title, details } as DataSet);
            setRawConfig(details ? stringify(details) : '');
          }}
        />
      );
    }

    if (activeStep === BaseStep.Configuration) {
      return (
        <div className="flex flex-col common-paddings border-b border-solid border-b-tertiary h-full">
          <DatasetConfigForm
            name={newDataSet?.title ?? ''}
            nameTouched={nameConfigTouched}
            onNameChange={(value) => {
              setDataSet({ ...newDataSet, title: value } as DataSet);
              setNameConfigTouched(true);
            }}
            config={rawConfig}
            onConfigChange={setRawConfig}
          />
        </div>
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
        isValidProviderStep={!selectedProviderId}
        isValidDataSetStep={!newDataSet?.details || !newDataSet?.title}
      />
    </Modal>
  );
};
