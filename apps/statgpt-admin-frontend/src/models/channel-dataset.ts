export interface ChannelDataset {
  dataset_id: number;
  preprocessing_status: string;
  dataset: {
    title: string;
    description: string;
    data_source: { title: string };
  };
}
