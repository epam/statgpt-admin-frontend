export interface AutoUpdateJob {
  id: number;
  created_at: string;
  updated_at: string;
  channel_dataset_id: number;
  base_version_id: number;
  created_version_id: number;
  status: string;
  result: string;
  details: string;
  reason_for_failure: string;
}
