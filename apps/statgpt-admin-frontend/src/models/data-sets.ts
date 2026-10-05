import { BaseEntity } from './base-entity';
import { ChannelDatasetVersion } from './channel-dataset-version';

export interface DataSetUrn {
  agencyId?: string;
  resourceId?: string;
  version?: string;
}

export interface DataSetDetails {
  urn?: DataSetUrn;
}

export interface DataSet extends BaseEntity {
  /** Data Source Id */
  data_source_id?: number;
  data_source?: {
    title?: string;
  };
  details?: DataSetDetails;
  preprocessing_status?: string;
}

/**
 * The dataset's `status.status` (aliased as `preprocessing_status` on `DataSet`) is a backend-fixed
 * literal, so it's a complete, known set of values rather than open-ended user data.
 */
export const DATASET_STATUS_VALUES = ['online', 'offline', 'invalid_config'];

export type ChannelResultStatus =
  | 'auto_updated'
  | 'needs_reindex'
  | 'no_version'
  | 'indexing_in_progress';

export interface ChannelResult {
  channel_dataset_id: number;
  status: ChannelResultStatus;
  channel: {
    id: number;
    title: string;
    description: string;
    deployment_id: string;
    llm_model: string;
    created_at: string;
    updated_at: string;
  };
  new_version: ChannelDatasetVersion | null;
}

export interface DataSetUpdateResponse extends DataSet {
  channel_results?: ChannelResult[];
}
