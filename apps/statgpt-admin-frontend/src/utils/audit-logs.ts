import { AuditLogRequestModel } from '../models/audit-log';

export function auditLogRequestToQueryString(
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
