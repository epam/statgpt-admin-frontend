'use client';

import { FC } from 'react';

import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { useChannelData } from '@/src/context/ChannelDataContext';
import { usePageInitialLoadingSync } from '@/src/context/NavigationLoadingContext';
import { DataSetsView } from './Datasets/Datasets';

interface Props {
  selectedChannelId: string;
}

export const ChannelView: FC<Props> = ({ selectedChannelId }) => {
  const { channel, isLoading } = useChannelData();
  usePageInitialLoadingSync(isLoading);

  return isLoading ? (
    <div className="flex items-center h-full w-full justify-center bg-layer-2">
      <Loader />
    </div>
  ) : (
    <div className="bg-layer-2 flex flex-col h-full common-paddings">
      <h1 className="mb-4">{channel?.title}</h1>
      <div className="flex-1 min-h-0">
        <DataSetsView selectedChannelId={selectedChannelId} />
      </div>
    </div>
  );
};
