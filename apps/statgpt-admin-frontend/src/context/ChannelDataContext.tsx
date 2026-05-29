'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { getChannel } from '@/src/app/channels/actions';
import { Channel } from '@/src/models/channel';
import { useAccessControl } from '@/src/context/AccessControlContext';
import { useApiNotification } from '@/src/hooks/use-api-notification';

interface ChannelDataContextValue {
  channel: Channel | null;
  isLoading: boolean;
}

const ChannelDataContext = createContext<ChannelDataContextValue>({
  channel: null,
  isLoading: true,
});

export function useChannelData() {
  return useContext(ChannelDataContext);
}

interface ProviderProps {
  channelId: string;
  children: ReactNode;
}

export function ChannelDataProvider({ channelId, children }: ProviderProps) {
  const { setForbidden } = useAccessControl();
  const withNotification = useApiNotification();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!channelId) return;

    setIsLoading(true);
    let cancelled = false;
    withNotification(
      getChannel(channelId),
      'Failed to Load Channel',
      [403],
    ).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (!result.ok) {
        if (result.error.status === 403) setForbidden();
        return;
      }
      setChannel(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [channelId, setForbidden, withNotification]);

  return (
    <ChannelDataContext.Provider value={{ channel, isLoading }}>
      {children}
    </ChannelDataContext.Provider>
  );
}
