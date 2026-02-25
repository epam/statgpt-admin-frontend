export interface AuditLog {
  id: number;
  entity_type: string;
  action_type: string;
  entity_id: string | null;
  entity_name: string | null;
  performed_by: string | null;
  performed_by_name: string | null;
  trace_id: string | null;
  created_at: string;
}

export interface AuditLogDetails extends AuditLog {
  state_before: string | null;
  state_after: string | null;
}

export interface AuditLogTimeRange {
  created_at_from?: string;
  created_at_to?: string;
}

export interface AuditLogRequestModel extends AuditLogTimeRange {
  limit?: number;
  offset?: number;
  entity_type?: string;
  action_type?: string;
  item_id?: number;
  trace_id?: string;
  entity_id?: string;
  entity_name?: string;
  performed_by?: string;
  performed_by_name?: string;
}

export interface AuditLogEnumValues {
  entity_types: string[];
  action_types: string[];
}
