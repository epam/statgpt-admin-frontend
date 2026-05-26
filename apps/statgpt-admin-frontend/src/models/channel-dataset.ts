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

export interface ChannelDataset {
  dataset_id: number;
  preprocessing_status: string;
  dataset: {
    title: string;
    description: string;
    data_source: { title: string };
  };
  last_auto_update_job?: AutoUpdateJob | null;
}
