import { AutoUpdateJob } from '@/src/models/auto-update-job';
import { ChannelDatasetVersion } from '@/src/models/channel-dataset-version';

export interface ChannelDataset {
  dataset_id: number;
  preprocessing_status: string;
  dataset: {
    title: string;
    description: string;
    data_source: { title: string };
  };
  last_completed_version?: ChannelDatasetVersion | null;
  latest_version?: ChannelDatasetVersion | null;
  last_auto_update_job?: AutoUpdateJob | null;
}
