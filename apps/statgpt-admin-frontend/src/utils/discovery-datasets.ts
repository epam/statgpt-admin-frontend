import { DiscoveryExportFormat } from '@/src/models/discovery-dataset';

export interface DiscoveryDatasetsRequestModel {
  limit: number;
  offset: number;
  agency?: string;
  validation_status?: string;
  indexing_status?: string;
}

export function mapDiscoveryDatasetsRequestToQueryString(
  params: DiscoveryDatasetsRequestModel,
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

export interface DiscoveryDatasetsExportOptions {
  channelId: string;
  format: DiscoveryExportFormat;
  includeValidation: boolean;
  ids: number[];
  filters: Pick<
    DiscoveryDatasetsRequestModel,
    'agency' | 'validation_status' | 'indexing_status'
  >;
}

/**
 * Builds the BFF URL that downloads the channel's Grade C datasets. Selected
 * ids replace the grid filters because the backend answers 422 when both are sent.
 * @param options - export format, validation flag, selected ids and active grid filters
 */
export function buildDiscoveryDatasetsExportUrl({
  channelId,
  format,
  includeValidation,
  ids,
  filters,
}: DiscoveryDatasetsExportOptions): string {
  const searchParams = new URLSearchParams({
    format,
    include_validation: String(includeValidation),
  });

  if (ids.length > 0) {
    ids.forEach((id) => searchParams.append('id', String(id)));
  } else {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
  }

  return `/api/v1/channels/${channelId}/discovery-datasets/export?${searchParams}`;
}
