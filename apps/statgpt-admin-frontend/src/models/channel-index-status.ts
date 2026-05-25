export interface ChannelIndexStatusDeduplication {
  deduplication_required: boolean;
  total_duplicate_count: number;
  non_indicator_dimensions_duplicate_count: number;
  special_dimensions_duplicate_count: number;
  indicator_dimensions_duplicate_count: number;
}

export interface ChannelIndexStatus {
  scope: string;
  vector_store: {
    deduplication: ChannelIndexStatusDeduplication;
    sizes: {
      non_indicator_dimensions_size: number;
      special_dimensions_size: number;
      indicator_dimensions_size: number;
    };
  };
}
