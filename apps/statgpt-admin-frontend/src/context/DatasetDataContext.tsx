'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { getChannelDatasets } from '@/src/app/channels/actions';
import { ChannelDataset } from '@/src/models/channel-dataset';
import { useAccessControl } from '@/src/context/AccessControlContext';
import { useApiNotification } from '@/src/hooks/use-api-notification';

interface DatasetDataContextValue {
  dataset: ChannelDataset | null;
  isLoading: boolean;
}

const DatasetDataContext = createContext<DatasetDataContextValue>({
  dataset: null,
  isLoading: true,
});

export function useDatasetData() {
  return useContext(DatasetDataContext);
}

interface ProviderProps {
  channelId: string;
  datasetId: string;
  children: ReactNode;
}

export function DatasetDataProvider({
  channelId,
  datasetId,
  children,
}: ProviderProps) {
  const { setForbidden } = useAccessControl();
  const withNotification = useApiNotification();

  const [dataset, setDataset] = useState<ChannelDataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!channelId || !datasetId) return;

    setIsLoading(true);
    let cancelled = false;
    withNotification(
      getChannelDatasets(channelId),
      'Failed to Load Dataset',
      [403],
    ).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (!result.ok) {
        if (result.error.status === 403) setForbidden();
        return;
      }
      const match =
        result.data.data.find((ds) => String(ds.dataset_id) === datasetId) ??
        null;
      setDataset(match);
    });
    return () => {
      cancelled = true;
    };
  }, [channelId, datasetId, setForbidden, withNotification]);

  return (
    <DatasetDataContext.Provider value={{ dataset, isLoading }}>
      {children}
    </DatasetDataContext.Provider>
  );
}
