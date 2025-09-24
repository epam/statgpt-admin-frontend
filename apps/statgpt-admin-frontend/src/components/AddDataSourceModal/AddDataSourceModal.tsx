import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { parse } from 'yaml';

import {
  createDataSource,
  getDataSourcesTypes,
} from '@/src/app/data-sources/actions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { Configuration } from '@/src/components/Configuration/Configuration';
import { Modal } from '@/src/components/Modal/Modal';
import { Stepper } from '@/src/components/Stepper/Stepper';
import { BaseStep } from '@/src/constants/steps';
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
  const [isLoading, setIsLoading] = useState(false);
  const [dsTypes, setDsTypes] = useState<DataSourceType[]>([]);
  const [isValidDataSource, setIsValidDataSource] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsValidDataSource(dataSource?.title != null && dataSource?.title !== '');
  }, [dataSource]);

  useEffect(() => {
    if (dsTypes.length === 0 && !isLoading) {
      setIsLoading(true);

      getDataSourcesTypes().then((types) => {
        setIsLoading(false);
        setDsTypes(types?.data || []);
      });
    }
  }, []);

  const create = () => {
    createDataSource(dataSource).then(() => {
      router.refresh();
      close();
    });
  };

  const getModalContent = () => {
    if (activeStep === BaseStep.Properties) {
      return isLoading ? (
        <div className="flex items-center justify-center w-full h-[360px]">
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
          height="360px"
          onChangeConfig={(v) =>
            setDataSource({
              ...(dataSource || {}),
              details: parse(v || ''),
            } as DataSource)
          }
        />
      );
    }
  };

  return (
    <Modal title="Add Data Source" close={close} width="1000px">
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
