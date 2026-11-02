import { getAuditLogColumnFilters } from './audit-logs';

describe('getAuditLogColumnFilters', () => {
  it('returns nothing for an empty filter model', () => {
    expect(getAuditLogColumnFilters({})).toEqual({});
    expect(getAuditLogColumnFilters(undefined)).toEqual({});
  });

  it('maps enum and text-contains filters to request fields', () => {
    expect(
      getAuditLogColumnFilters({
        entity_type: { value: 'CHANNEL' },
        action_type: { value: 'CREATE' },
        trace_id: { filterType: 'text', type: 'contains', filter: 'abc' },
        entity_id: { filterType: 'text', type: 'contains', filter: '42' },
        entity_name: { filterType: 'text', type: 'contains', filter: 'main' },
        performed_by_name: {
          filterType: 'text',
          type: 'contains',
          filter: 'admin',
        },
      }),
    ).toEqual({
      entity_type: 'CHANNEL',
      action_type: 'CREATE',
      trace_id: 'abc',
      entity_id: '42',
      entity_name: 'main',
      performed_by_name: 'admin',
    });
  });

  it('skips blank values and text filters of an unsupported type', () => {
    expect(
      getAuditLogColumnFilters({
        entity_type: { value: '  ' },
        trace_id: { filterType: 'text', type: 'contains', filter: ' ' },
        entity_name: { filterType: 'text', type: 'equals', filter: 'main' },
      }),
    ).toEqual({});
  });

  it('ignores fields that are not audit log columns', () => {
    expect(
      getAuditLogColumnFilters({
        agency: { value: 'OECD' },
        created_at: { filterType: 'text', type: 'contains', filter: 'x' },
      }),
    ).toEqual({});
  });
});
