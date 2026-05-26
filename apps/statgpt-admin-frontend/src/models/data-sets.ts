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
  details?: DataSetDetails;
  preprocessing_status?: string;
}

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
