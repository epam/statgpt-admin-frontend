import { EnumSelectEmptyFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFilter/EnumSelectEmptyFilter';
import { EnumSelectFilter } from '@/src/components/GridView/CustomFilters/EnumSelectFilter/EnumSelectFilter';
import { getDiscoveryDatasetsColumns } from './discovery-datasets';

describe('getDiscoveryDatasetsColumns', () => {
  const columns = getDiscoveryDatasetsColumns(() => {});
  const byField = (field: string) => columns.find((c) => c.field === field);

  it('gives agency an exact-match text filter, matching the backend agency_key equality check', () => {
    expect(byField('agency')).toMatchObject({
      filter: 'agTextColumnFilter',
      filterParams: expect.objectContaining({
        filterOptions: ['equals'],
        defaultOption: 'equals',
      }),
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
