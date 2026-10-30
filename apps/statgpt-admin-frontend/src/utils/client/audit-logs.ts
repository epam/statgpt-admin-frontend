import type { AuditLogRequestModel } from '@/src/models/audit-log';
import { getEnumFilterValue, getTextContains } from './grid';

export type AuditLogColumnFilters = Pick<
  AuditLogRequestModel,
  | 'entity_type'
  | 'action_type'
  | 'trace_id'
  | 'entity_id'
  | 'entity_name'
  | 'performed_by_name'
>;

/**
 * Extracts the audit log column filters from the grid's filter model, leaving
 * out columns that have no active filter. Used by both the list request and the
 * export so the two always apply the same filters.
 * @param filterModel - the grid's current filter model
 */
export function getAuditLogColumnFilters(
  filterModel: unknown,
): AuditLogColumnFilters {
  const entity_type = getEnumFilterValue(filterModel, 'entity_type');
  const action_type = getEnumFilterValue(filterModel, 'action_type');
  const trace_id = getTextContains(filterModel, 'trace_id');
  const entity_id = getTextContains(filterModel, 'entity_id');
  const entity_name = getTextContains(filterModel, 'entity_name');
  const performed_by_name = getTextContains(filterModel, 'performed_by_name');

  return {
    ...(entity_type ? { entity_type } : {}),
    ...(action_type ? { action_type } : {}),
    ...(trace_id ? { trace_id } : {}),
    ...(entity_id ? { entity_id } : {}),
    ...(entity_name ? { entity_name } : {}),
    ...(performed_by_name ? { performed_by_name } : {}),
  };
}
