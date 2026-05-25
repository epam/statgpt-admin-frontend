export interface ChannelDatasetVersion {
  id: number;
  created_at: string;
  updated_at: string;
  channel_dataset_id: number;
  version: number;
  preprocessing_status: string;
  creation_reason: string;
  reason_for_failure: string;
  pointer_to: number;
  indexing_config_hash: string;
  structure_metadata: Record<string, unknown>;
  structure_hash: string;
  indicator_dimensions_hash: string;
  non_indicator_dimensions_hash: string;
  special_dimensions_hash: string;
  resolved_config: Record<string, unknown>;
  indexing_stats: {
    harmonization?: {
      error_types: Record<string, unknown>;
      errors: number;
      total: number;
    };
    normalization?: {
      error_types: Record<string, unknown>;
      errors: number;
      total: number;
    };
  } | null;
}
