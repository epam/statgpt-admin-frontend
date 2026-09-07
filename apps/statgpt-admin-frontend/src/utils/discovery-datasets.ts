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
