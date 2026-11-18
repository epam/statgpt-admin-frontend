/* global describe, it, expect, jest, beforeEach */
import { channelsApi } from '@/src/app/api/api';
import { GET } from './route';

jest.mock('@/src/app/api/api', () => ({
  channelsApi: { exportChannelDiscoveryDatasets: jest.fn() },
}));
jest.mock('@/src/utils/auth/get-token', () => ({
  getRequestToken: jest.fn().mockResolvedValue(null),
}));
jest.mock('@/src/server/feature-flag-guard', () => ({
  guardDiscoveryDatasetsEnabled: () => undefined,
}));

const mockedExport = channelsApi.exportChannelDiscoveryDatasets as jest.Mock;

const callExport = (query: string) =>
  GET({ url: `http://localhost/export?${query}` } as Request, {
    params: Promise.resolve({ id: '7' }),
  });

describe('GET /api/v1/channels/[id]/discovery-datasets/export', () => {
  beforeEach(() => {
    mockedExport.mockReset();
    mockedExport.mockResolvedValue('response');
  });

  it('forwards the filters, the format, the validation flag and every id', async () => {
    await callExport(
      'agency=WB&validation_status=INVALID&indexing_status=NEW&format=xlsx&include_validation=true&id=3&id=5',
    );

    expect(mockedExport).toHaveBeenCalledWith('7', null, {
      agency: 'WB',
      validation_status: 'INVALID',
      indexing_status: 'NEW',
      format: 'xlsx',
      include_validation: 'true',
      ids: ['3', '5'],
    });
  });

  it('forwards nothing for absent parameters', async () => {
    await callExport('');

    expect(mockedExport).toHaveBeenCalledWith('7', null, {
      agency: undefined,
      validation_status: undefined,
      indexing_status: undefined,
      format: undefined,
      include_validation: undefined,
      ids: [],
    });
  });
});
