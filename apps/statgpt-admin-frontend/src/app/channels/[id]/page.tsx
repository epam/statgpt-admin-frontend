'use client';

import { useParams } from 'next/navigation';

import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { ChannelDatasetsTabs } from '@/src/components/ChannelView/ChannelDatasetsTabs/ChannelDatasetsTabs';
import { DataSetsView } from '@/src/components/ChannelView/Datasets/Datasets';
import { useSetBreadcrumbs } from '@/src/context/BreadcrumbContext';
import { useChannelData } from '@/src/context/ChannelDataContext';
import { useFeatureFlags } from '@/src/context/FeatureFlagsContext';
import { usePageInitialLoadingSync } from '@/src/context/NavigationLoadingContext';
import { Menu } from '@/src/constants/menu';
import { ROUTES } from '@/src/constants/routes';

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const { channel, isLoading } = useChannelData();
  const { discoveryDatasets } = useFeatureFlags();
  usePageInitialLoadingSync(isLoading);

  useSetBreadcrumbs([
    { name: Menu.CHANNELS, href: ROUTES.channels },
    { name: channel?.title ?? id },
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center h-full w-full justify-center bg-layer-2">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-layer-2 flex flex-col h-full common-paddings">
      <h1 className="mb-4">{channel?.title}</h1>
      {discoveryDatasets ? (
        <ChannelDatasetsTabs channelId={id} />
      ) : (
        <div className="flex-1 min-h-0 mt-4">
          <DataSetsView selectedChannelId={id} />
        </div>
      )}
    </div>
  );
}
