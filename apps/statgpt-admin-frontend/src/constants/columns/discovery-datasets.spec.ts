import { EnumSelectEmptyFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFilter/EnumSelectEmptyFilter';
import { EnumSelectFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFilter/EnumSelectFilter';
import {
  DiscoveryIndexingStatus,
  DiscoveryValidationStatus,
} from '@/src/models/discovery-dataset';
import {
  getDiscoveryDatasetsColumns,
  getDiscoveryDatasetsFilterValues,
} from './discovery-datasets';

describe('getDiscoveryDatasetsFilterValues', () => {
  it('lists agencies in the order the stats map holds them', () => {
    const values = getDiscoveryDatasetsFilterValues({
      total: 3,
      byValidationStatus: {} as never,
      byIndexingStatus: {} as never,
      byAgency: { 'Bank Indonesia (BI)': 2, OECD: 1 },
    });

    expect(values.agency).toEqual(['Bank Indonesia (BI)', 'OECD']);
  });

  it('drops statuses the channel holds no records for', () => {
    const values = getDiscoveryDatasetsFilterValues({
      total: 3,
      byValidationStatus: {
        [DiscoveryValidationStatus.Valid]: 3,
        [DiscoveryValidationStatus.Invalid]: 0,
        [DiscoveryValidationStatus.NotValidated]: 0,
      },
      byIndexingStatus: {
        [DiscoveryIndexingStatus.Indexed]: 3,
        [DiscoveryIndexingStatus.New]: 0,
        [DiscoveryIndexingStatus.Outdated]: 0,
        [DiscoveryIndexingStatus.Failed]: 0,
      },
      byAgency: {},
    });

    expect(values.validationStatus).toEqual([DiscoveryValidationStatus.Valid]);
    expect(values.indexingStatus).toEqual([DiscoveryIndexingStatus.Indexed]);
  });

  it('returns empty lists with no stats yet', () => {
    expect(getDiscoveryDatasetsFilterValues(null)).toEqual({
      agency: [],
      validationStatus: [],
      indexingStatus: [],
    });
  });
});

describe('getDiscoveryDatasetsColumns', () => {
  const columns = getDiscoveryDatasetsColumns(() => {}, {
    agency: ['Bank Indonesia (BI)', 'OECD'],
    validationStatus: [DiscoveryValidationStatus.Valid],
    indexingStatus: [DiscoveryIndexingStatus.Indexed],
  });
  const byField = (field: string) => columns.find((c) => c.field === field);

  it('gives agency an enum select filter populated from the channel data, with an empty floating filter', () => {
    expect(byField('agency')).toMatchObject({
      filter: EnumSelectFilter,
      filterParams: { values: ['Bank Indonesia (BI)', 'OECD'] },
      floatingFilterComponent: EnumSelectEmptyFilter,
    });
  });

  it('gives validationStatus an enum select filter with an empty floating filter', () => {
    expect(byField('validationStatus')).toMatchObject({
      filter: EnumSelectFilter,
      floatingFilterComponent: EnumSelectEmptyFilter,
    });
  });

  it('gives indexingStatus an enum select filter with an empty floating filter', () => {
    expect(byField('indexingStatus')).toMatchObject({
      filter: EnumSelectFilter,
      floatingFilterComponent: EnumSelectEmptyFilter,
    });
  });

  it('does not add a filter to unsupported free-text columns', () => {
    expect(byField('name')?.filter).toBeUndefined();
    expect(byField('url')?.filter).toBeUndefined();
  });
});
