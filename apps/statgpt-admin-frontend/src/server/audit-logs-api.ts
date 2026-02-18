import { AuditLog, AuditLogDetails } from '@/src/models/audit-log';
import { JWT } from 'next-auth/jwt';
import { RequestData } from '@/src/models/request-data';
import { MAIN_API } from './api';
import { BaseApi } from './base-api';
import { mockAuditLogs } from './__moks__/api-logs';

export const AUDIT_LOGS_URL = `${MAIN_API}/audit-logs`;

export const AUDIT_LOGS_ID_URL = (id?: string | number): string =>
  `${AUDIT_LOGS_URL}/${id}`;

export class AuditLogsApi extends BaseApi {
  getAuditLogs(token: JWT | null): Promise<RequestData<AuditLog> | null> {
    return this.get<RequestData<AuditLog>>(AUDIT_LOGS_URL, token);
  }

  getAuditLogById(
    id: string,
    token: JWT | null,
  ): Promise<RequestData<AuditLogDetails> | null> {
    return this.get(AUDIT_LOGS_ID_URL(id), token);
  }
}
