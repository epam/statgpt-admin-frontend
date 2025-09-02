import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { parse } from 'yaml';

import { createChannel } from '@/src/app/channels/actions';
import { Configuration } from '@/src/components/Configuration/Configuration';
import { Modal } from '@/src/components/Modal/Modal';
import { Stepper } from '@/src/components/Stepper/Stepper';
import { BaseStep } from '@/src/constants/steps';
import { Channel } from '@/src/models/channel';
import { Step } from '@/src/models/step';
import { ModalButtons } from './Buttons/Buttons';
import { ChannelProperties } from './Properties/Properties';

interface Props {
  close: () => void;
}

export const AddChannelsModal: FC<Props> = ({ close }) => {
  const steps: Step[] = [
    {
      key: BaseStep.Properties,
      isCompleted: () => isValidChannel,
    },
    { key: BaseStep.Configuration },
  ];
  const [activeStep, setActiveStep] = useState(steps[0].key);

  const [channel, setChannel] = useState<Channel>({
    title: '',
    deployment_id: '',
    llm_model: '',
    details: {},
  });

  const [isValidChannel, setIsValidChannel] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsValidChannel(
      channel?.title != null &&
        channel?.title !== '' &&
        channel?.deployment_id !== '' &&
        channel?.llm_model !== '',
    );
  }, [channel]);

  const create = () => {
    createChannel(channel).then(() => {
      router.refresh();
      close();
    });
  };

  const getModalContent = () => {
    if (activeStep === BaseStep.Properties) {
      return (
        <ChannelProperties
          channel={channel}
          updateChannel={(ch) => setChannel(ch)}
        />
      );
    }

    if (activeStep === BaseStep.Configuration) {
      return (
        <Configuration
          height="270px"
          onChangeConfig={(v) =>
            setChannel({
              ...channel,
              details: parse(v || ''),
            } as Channel)
          }
        />
      );
    }
  };

  return (
    <Modal title="Add Channel" close={close} width="60%">
      <>
        <Stepper
          activeStep={activeStep}
          steps={steps}
          onChangeActiveStep={(step) => setActiveStep(step)}
        />
      </>
      <>{getModalContent()}</>

      <ModalButtons
        close={close}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        create={create}
        isValidChannel={isValidChannel}
      />
    </Modal>
  );
};
