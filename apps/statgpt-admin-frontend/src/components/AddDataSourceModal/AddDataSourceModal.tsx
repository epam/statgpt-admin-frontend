import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import {
  createDataSource,
  getDataSourcesTypes,
} from '@/src/app/data-sources/actions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { Configuration } from '@/src/components/Configuration/Configuration';
import { Modal } from '@/src/components/Modal/Modal';
import { Stepper } from '@/src/components/Stepper/Stepper';
import { BaseStep } from '@/src/constants/steps';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { useYamlParser } from '@/src/hooks/use-yaml-parser';
import { DataSource, DataSourceType } from '@/src/models/data-source';
import { Step } from '@/src/models/step';
import { ModalButtons } from './Buttons/ModalButtons';
import { DataSourceProperties } from './Properties/Properties';

interface Props {
  close: () => void;
}

export const AddDataSourceModal: FC<Props> = ({ close }) => {
  const DATA_SOURCE_STEPS: Step[] = [
    {
      key: BaseStep.Properties,
      isCompleted: () => {
        return isValidDataSource;
      },
    },
    { key: BaseStep.Configuration },
  ];

  const [activeStep, setActiveStep] = useState(DATA_SOURCE_STEPS[0].key);
  const [dataSource, setDataSource] = useState<DataSource>({
    details: {},
  });
  const [rawConfig, setRawConfig] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dsTypes, setDsTypes] = useState<DataSourceType[]>([]);
  const [isValidDataSource, setIsValidDataSource] = useState(false);
  const router = useRouter();
  const withNotification = useApiNotification();
  const parseYaml = useYamlParser();

  useEffect(() => {
    setIsValidDataSource(dataSource?.title != null && dataSource?.title !== '');
  }, [dataSource]);

  useEffect(() => {
    if (dsTypes.length === 0 && !isLoading) {
      setIsLoading(true);

      withNotification(
        getDataSourcesTypes(),
        'Failed to Load Data Source Types',
      ).then((result) => {
        setIsLoading(false);
        if (result.ok) setDsTypes(result.data.data);
      });
    }
  }, []);

  const create = () => {
    let details = dataSource.details;
    if (rawConfig) {
      const parsed = parseYaml(rawConfig);
      if (!parsed.ok) return;
      details = parsed.value;
    }
    withNotification(
      createDataSource({ ...dataSource, details }),
      'Create Data Source Failed',
    ).then((result) => {
      if (result.ok) {
        router.refresh();
        close();
      }
    });
  };

  const getModalContent = () => {
    if (activeStep === BaseStep.Properties) {
      return isLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <Loader />
        </div>
      ) : (
        <DataSourceProperties
          dataSource={dataSource}
          dsTypes={dsTypes}
          changeDsDetails={(ds) =>
            setDataSource({
              ...(dataSource || {}),
              ...ds,
            } as DataSource)
          }
          changeDsType={(type) =>
            setDataSource({
              ...(dataSource || {}),
              type_id: type,
            } as DataSource)
          }
        />
      );
    }

    if (activeStep === BaseStep.Configuration) {
      return (
        <Configuration
          height="100%"
          onChangeConfig={(v) => setRawConfig(v || '')}
        />
      );
    }
  };

  return (
    <Modal title="Add Data Source" close={close} width="1000px" height="80vh">
      <Stepper
        activeStep={activeStep}
        steps={DATA_SOURCE_STEPS}
        onChangeActiveStep={(step) => setActiveStep(step)}
      />
      <>{getModalContent()}</>

      <ModalButtons
        createDataSource={create}
        isValidDataSource={isValidDataSource}
        close={close}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />
    </Modal>
  );
};
