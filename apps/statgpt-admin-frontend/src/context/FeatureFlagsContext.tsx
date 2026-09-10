'use client';

import { createContext, ReactNode, useContext } from 'react';

export interface FeatureFlags {
  discoveryDatasets: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlags>({
  discoveryDatasets: false,
});

export function useFeatureFlags(): FeatureFlags {
  return useContext(FeatureFlagsContext);
}

interface ProviderProps {
  flags: FeatureFlags;
  children: ReactNode;
}

/**
 * Carries deploy-time feature flags from the server into client components.
 * Flags are read from environment variables in a server component and passed
 * in as a prop, so they stay runtime configuration rather than being inlined
 * into the client bundle at build time.
 */
export function FeatureFlagsProvider({ flags, children }: ProviderProps) {
  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}
