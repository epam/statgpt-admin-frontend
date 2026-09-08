'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { Tabs, TabItem } from '@/src/components/BaseComponents/Tabs/Tabs';
import { DataSetsView } from '@/src/components/ChannelView/Datasets/Datasets';
import { DiscoveryDatasetsView } from '@/src/components/DiscoveryDatasetsView/DiscoveryDatasetsView';
import { useSetBreadcrumbs } from '@/src/context/BreadcrumbContext';
import { useChannelData } from '@/src/context/ChannelDataContext';
import { usePageInitialLoadingSync } from '@/src/context/NavigationLoadingContext';
import { useTabQueryParam } from '@/src/hooks/use-tab-query-param';
import { Menu } from '@/src/constants/menu';
import { ROUTES } from '@/src/constants/routes';

enum ChannelTab {
  GradeA = 'grade-a',
  GradeC = 'grade-c',
}

const CHANNEL_TABS: TabItem<ChannelTab>[] = [
  { key: ChannelTab.GradeA, label: 'Grade A datasets' },
  { key: ChannelTab.GradeC, label: 'Grade C datasets' },
];

const CHANNEL_TAB_KEYS: ChannelTab[] = [ChannelTab.GradeA, ChannelTab.GradeC];

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const { channel, isLoading } = useChannelData();
  usePageInitialLoadingSync(isLoading);
  const [activeTab, setActiveTab] = useTabQueryParam<ChannelTab>(
    'tab',
    CHANNEL_TAB_KEYS,
    ChannelTab.GradeA,
  );

  // A tab is added here the first time it becomes active, and then stays
  // mounted (just hidden via CSS) so switching back to it doesn't refetch
  // its data or lose its grid state.
  const [visitedTabs, setVisitedTabs] = useState<Set<ChannelTab>>(
    () => new Set([activeTab]),
  );
  if (!visitedTabs.has(activeTab)) {
    setVisitedTabs((prev) => new Set(prev).add(activeTab));
  }

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
      <Tabs
        tabs={CHANNEL_TABS}
        activeKey={activeTab}
        onChange={setActiveTab}
        ariaLabel="Channel dataset views"
      />
      <div className="flex-1 min-h-0 mt-4">
        {visitedTabs.has(ChannelTab.GradeA) && (
          <div hidden={activeTab !== ChannelTab.GradeA} className="h-full">
            <DataSetsView selectedChannelId={id} />
          </div>
        )}
        {visitedTabs.has(ChannelTab.GradeC) && (
          <div hidden={activeTab !== ChannelTab.GradeC} className="h-full">
            <DiscoveryDatasetsView selectedChannelId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
