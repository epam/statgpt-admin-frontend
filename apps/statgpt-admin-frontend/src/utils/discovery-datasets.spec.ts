import { mapDiscoveryDatasetsRequestToQueryString } from './discovery-datasets';

describe('mapDiscoveryDatasetsRequestToQueryString', () => {
  it('includes limit and offset', () => {
    const query = mapDiscoveryDatasetsRequestToQueryString({
      limit: 100,
      offset: 0,
    });

    expect(query).toBe('limit=100&offset=0');
  });

  it('includes agency, validation_status and indexing_status when set', () => {
    const query = mapDiscoveryDatasetsRequestToQueryString({
      limit: 100,
      offset: 200,
      agency: 'World Bank',
      validation_status: 'VALID',
      indexing_status: 'INDEXED',
    });

    expect(query).toBe(
      'limit=100&offset=200&agency=World+Bank&validation_status=VALID&indexing_status=INDEXED',
    );
  });

  it('omits undefined and empty filter values', () => {
    const query = mapDiscoveryDatasetsRequestToQueryString({
      limit: 100,
      offset: 0,
      agency: undefined,
      validation_status: '',
      indexing_status: undefined,
    });

    expect(query).toBe('limit=100&offset=0');
  });
});
