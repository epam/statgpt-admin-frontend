/**
 * Whether Grade C (discovery) datasets are enabled for this deployment.
 * Opt-in: anything other than `true` keeps the feature hidden, so a
 * deployment that never sets the variable gets it disabled.
 */
export const getIsDiscoveryDatasetsEnabled = (): boolean =>
  process.env.ENABLE_DISCOVERY_DATASETS?.trim().toLowerCase() === 'true';
