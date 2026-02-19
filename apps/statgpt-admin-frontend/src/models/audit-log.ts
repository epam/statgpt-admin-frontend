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
  entity_id?: string;
  performed_by?: string;
}
