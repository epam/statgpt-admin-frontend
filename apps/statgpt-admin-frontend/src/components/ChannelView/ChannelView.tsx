'use client';

import { FC, useEffect, useState } from 'react';

import { getChannel } from '@/src/app/channels/actions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { Channel } from '@/src/models/channel';
import { DataSetsView } from './Datasets/Datasets';

interface Props {
  selectedChannelId: string;
}

export const ChannelView: FC<Props> = ({ selectedChannelId }) => {
  const withNotification = useApiNotification();
  const [selectedChannel, setSelectedChannel] = useState<Channel | undefined>(
    void 0,
  );

  const [isLoadingChannel, setIsLoadingChannel] = useState(true);

  useEffect(() => {
    if (selectedChannel == null) {
      withNotification(
        getChannel(selectedChannelId),
        'Failed to Load Channel',
      ).then((result) => {
        setIsLoadingChannel(false);
        if (result.ok) setSelectedChannel(result.data);
      });
    }
  }, [selectedChannelId]);

  return isLoadingChannel ? (
    <div className="flex items-center h-full w-full justify-center bg-layer-2">
      <Loader />
    </div>
  ) : (
    <div className="bg-layer-2 flex flex-col h-full common-paddings">
      <h1 className="mb-4">{selectedChannel?.title}</h1>
      <div className="flex-1 min-h-0">
        <DataSetsView selectedChannelId={selectedChannelId} />
      </div>
    </div>
  );
};
