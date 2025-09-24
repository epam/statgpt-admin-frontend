import { FC } from 'react';

import { FieldWithInput } from '@/src/components/BaseComponents/Fields/FieldWithInput';
import { FieldWithTextarea } from '@/src/components/BaseComponents/Fields/FieldWithTextarea';
import { Channel } from '@/src/models/channel';

interface Props {
  channel?: Channel;
  updateChannel: (channel: Channel) => void;
}

export const ChannelProperties: FC<Props> = ({ updateChannel, channel }) => {
  return (
    <div className="h-full flex flex-col common-paddings">
      <FieldWithInput
        title="Name"
        inputPlaceholder="A name of your Channel."
        inputValue={channel?.title}
        required={true}
        onChange={(name) =>
          updateChannel({ ...channel, title: name as string } as Channel)
        }
      />
      <FieldWithInput
        title="Deployment ID"
        inputPlaceholder="A deployment ID of your Channel."
        inputValue={channel?.deployment_id}
        required={true}
        onChange={(deployment_id) =>
          updateChannel({
            ...channel,
            deployment_id: deployment_id as string,
          } as Channel)
        }
      />

      <FieldWithInput
        title="LLM Model"
        inputPlaceholder="A LLM Model ID of your Channel."
        inputValue={channel?.llm_model}
        required={true}
        onChange={(llm_model) =>
          updateChannel({
            ...channel,
            llm_model: llm_model as string,
          } as Channel)
        }
      />
      <div className="flex-1 min-h-0">
        <FieldWithTextarea
          title="Description"
          inputPlaceholder="A description of your Channel."
          inputValue={channel?.description}
          cssClassName="h-full"
          onChange={(description) =>
            updateChannel({
              ...channel,
              description: description as string,
            } as Channel)
          }
        />
      </div>
    </div>
  );
};
