import {
  AuditLog,
  AuditLogDetails,
  AuditLogRequestModel,
} from '@/src/models/audit-log';
import { JWT } from 'next-auth/jwt';
import { RequestData } from '@/src/models/request-data';
import { MAIN_API } from './api';
import { BaseApi } from './base-api';

export const AUDIT_LOGS_URL = `${MAIN_API}/audit-logs`;

export const AUDIT_LOGS_ID_URL = (id?: string | number): string =>
  `${AUDIT_LOGS_URL}/${id}`;

export class AuditLogsApi extends BaseApi {
  getAuditLogs(
    token: JWT | null,
    params?: AuditLogRequestModel,
  ): Promise<RequestData<AuditLog> | null> {
    let url = AUDIT_LOGS_URL;

    if (params) {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.get<RequestData<AuditLog>>(url, token);
  }

  getAuditLogById(
    id: string,
    token: JWT | null,
  ): Promise<RequestData<AuditLogDetails> | null> {
    return this.get(AUDIT_LOGS_ID_URL(id), token);
  }
}
