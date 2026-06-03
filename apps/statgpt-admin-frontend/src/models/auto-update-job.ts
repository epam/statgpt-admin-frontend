import { PreprocessingStatus } from '@/src/models/preprocessing-status';

export enum AutoUpdateResult {
  NO_COMPLETED_VERSION = 'NO_COMPLETED_VERSION',
  NO_CHANGES = 'NO_CHANGES',
  CONFIG_UPDATED = 'CONFIG_UPDATED',
  CONFIG_INCOMPATIBLE = 'CONFIG_INCOMPATIBLE',
  REINDEX_TRIGGERED = 'REINDEX_TRIGGERED',
}

export const AUTO_UPDATE_RESULT_LABEL: Record<AutoUpdateResult, string> = {
  [AutoUpdateResult.NO_COMPLETED_VERSION]: 'No completed version',
  [AutoUpdateResult.NO_CHANGES]: 'No changes',
  [AutoUpdateResult.CONFIG_UPDATED]: 'Config updated',
  [AutoUpdateResult.CONFIG_INCOMPATIBLE]: 'Config incompatible',
  [AutoUpdateResult.REINDEX_TRIGGERED]: 'Reindex triggered',
};

export interface AutoUpdateJob {
  id: number;
  created_at: string;
  updated_at: string;
  channel_dataset_id: number;
  base_version_id: number;
  created_version_id: number;
  status: PreprocessingStatus;
  result: AutoUpdateResult | null;
  details: string;
  reason_for_failure: string;
}
