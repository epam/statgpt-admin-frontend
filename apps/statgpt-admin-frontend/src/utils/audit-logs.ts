import { AuditLogRequestModel } from '../models/audit-log';
import { parseNumber } from './number';

export function mapAuditLogRequestToQueryString(
  params: AuditLogRequestModel,
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

export function mapSearchParamsToAuditLogRequest(
  searchParams: URLSearchParams,
): AuditLogRequestModel {
  const params: AuditLogRequestModel = {
    limit: parseNumber(searchParams.get('limit')),
    offset: parseNumber(searchParams.get('offset')),
    entity_type: searchParams.get('entity_type') ?? undefined,
    action_type: searchParams.get('action_type') ?? undefined,
    item_id: parseNumber(searchParams.get('item_id')),
    trace_id: searchParams.get('trace_id') ?? undefined,
    entity_id: searchParams.get('entity_id') ?? undefined,
    entity_name: searchParams.get('entity_name') ?? undefined,
    performed_by: searchParams.get('performed_by') ?? undefined,
    performed_by_name: searchParams.get('performed_by_name') ?? undefined,
    created_at_from: searchParams.get('created_at_from') ?? undefined,
    created_at_to: searchParams.get('created_at_to') ?? undefined,
  };

  return params;
}
