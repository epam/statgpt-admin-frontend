import { DiscoveryExportFormat } from '@/src/models/discovery-dataset';
import {
  buildDiscoveryDatasetsExportUrl,
  mapDiscoveryDatasetsRequestToQueryString,
} from './discovery-datasets';

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

describe('buildDiscoveryDatasetsExportUrl', () => {
  const EXPORT_PATH = '/api/v1/channels/42/discovery-datasets/export';

  const base = {
    channelId: '42',
    format: DiscoveryExportFormat.Excel,
    includeValidation: true,
    ids: [] as number[],
    filters: {},
  };

  it('always sends the format and the validation flag explicitly', () => {
    expect(buildDiscoveryDatasetsExportUrl(base)).toBe(
      `${EXPORT_PATH}?format=xlsx&include_validation=true`,
    );
    expect(
      buildDiscoveryDatasetsExportUrl({
        ...base,
        format: DiscoveryExportFormat.Csv,
        includeValidation: false,
      }),
    ).toBe(`${EXPORT_PATH}?format=csv&include_validation=false`);
  });

  it('sends the active filters when nothing is selected', () => {
    const url = buildDiscoveryDatasetsExportUrl({
      ...base,
      filters: {
        agency: 'World Bank',
        validation_status: 'INVALID',
        indexing_status: 'NEW',
      },
    });

    expect(url).toBe(
      `${EXPORT_PATH}?format=xlsx&include_validation=true&agency=World+Bank&validation_status=INVALID&indexing_status=NEW`,
    );
  });

  it('omits empty filter values', () => {
    const url = buildDiscoveryDatasetsExportUrl({
      ...base,
      filters: { agency: '', validation_status: undefined },
    });

    expect(url).toBe(`${EXPORT_PATH}?format=xlsx&include_validation=true`);
  });

  it('sends one id parameter per selected row', () => {
    const url = buildDiscoveryDatasetsExportUrl({ ...base, ids: [3, 5, 8] });

    expect(url).toBe(
      `${EXPORT_PATH}?format=xlsx&include_validation=true&id=3&id=5&id=8`,
    );
  });

  it('drops the filters when rows are selected, since the backend rejects id with filters', () => {
    const url = buildDiscoveryDatasetsExportUrl({
      ...base,
      ids: [3],
      filters: {
        agency: 'World Bank',
        validation_status: 'INVALID',
        indexing_status: 'NEW',
      },
    });

    expect(url).toBe(`${EXPORT_PATH}?format=xlsx&include_validation=true&id=3`);
  });
});
