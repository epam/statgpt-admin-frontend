'use client';

import { useState } from 'react';

import { Tabs, TabItem } from '@/src/components/BaseComponents/Tabs/Tabs';
import { DataSetsView } from '@/src/components/ChannelView/Datasets/Datasets';
import { DiscoveryDatasetsView } from '@/src/components/DiscoveryDatasetsView/DiscoveryDatasetsView';
import { useTabQueryParam } from '@/src/hooks/use-tab-query-param';

enum ChannelTab {
  GradeA = 'grade-a',
  GradeC = 'grade-c',
}

const CHANNEL_TABS: TabItem<ChannelTab>[] = [
  { key: ChannelTab.GradeA, label: 'Grade A datasets' },
  { key: ChannelTab.GradeC, label: 'Grade C datasets' },
];

const CHANNEL_TAB_KEYS: ChannelTab[] = [ChannelTab.GradeA, ChannelTab.GradeC];

/**
 * Grade A and Grade C dataset views for a channel, as URL-synced tabs.
 * Rendered only where Grade C datasets are enabled.
 * @param channelId - channel whose datasets are shown
 */
export function ChannelDatasetsTabs({ channelId }: { channelId: string }) {
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

  return (
    <>
      <Tabs
        tabs={CHANNEL_TABS}
        activeKey={activeTab}
        onChange={setActiveTab}
        ariaLabel="Channel dataset views"
      />
      <div className="flex-1 min-h-0 mt-4">
        {visitedTabs.has(ChannelTab.GradeA) && (
          <div hidden={activeTab !== ChannelTab.GradeA} className="h-full">
            <DataSetsView selectedChannelId={channelId} />
          </div>
        )}
        {visitedTabs.has(ChannelTab.GradeC) && (
          <div hidden={activeTab !== ChannelTab.GradeC} className="h-full">
            <DiscoveryDatasetsView selectedChannelId={channelId} />
          </div>
        )}
      </div>
    </>
  );
}
