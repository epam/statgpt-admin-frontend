import { pruneStaleEnumFilters } from './grid';

describe('pruneStaleEnumFilters', () => {
  const allowed = { agency: ['OECD'], indexingStatus: ['indexed'] };

  it('drops a filter whose value is no longer allowed', () => {
    expect(pruneStaleEnumFilters({ agency: { value: 'BI' } }, allowed)).toEqual(
      {},
    );
  });

  it('keeps still-valid filters while dropping stale ones', () => {
    expect(
      pruneStaleEnumFilters(
        { agency: { value: 'BI' }, indexingStatus: { value: 'indexed' } },
        allowed,
      ),
    ).toEqual({ indexingStatus: { value: 'indexed' } });
  });

  it('returns null when nothing is stale', () => {
    expect(
      pruneStaleEnumFilters({ agency: { value: 'OECD' } }, allowed),
    ).toBeNull();
  });

  it('leaves fields without allowed values untouched', () => {
    expect(pruneStaleEnumFilters({ name: { value: 'x' } }, allowed)).toBeNull();
  });

  it('returns null for an empty or missing model', () => {
    expect(pruneStaleEnumFilters({}, allowed)).toBeNull();
    expect(pruneStaleEnumFilters(null, allowed)).toBeNull();
  });
});
