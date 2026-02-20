import {
  AuditLog,
  AuditLogDetails,
  AuditLogRequestModel,
} from '@/src/models/audit-log';
import { JWT } from 'next-auth/jwt';
import { RequestData } from '@/src/models/request-data';
import { MAIN_API } from './api';
import { BaseApi } from './base-api';

const AUDIT_LOGS_URL = `${MAIN_API}/audit-logs`;
const AUDIT_LOGS_ID_URL = (id?: string | number): string =>
  `${AUDIT_LOGS_URL}/${id}`;
const EXPORT_URL = `${AUDIT_LOGS_URL}/export`;

export class AuditLogsApi extends BaseApi {
  getAuditLogs(
    token: JWT | null,
    params?: AuditLogRequestModel,
  ): Promise<RequestData<AuditLog> | null> {
    let url = AUDIT_LOGS_URL;

    if (params) {
      const queryString = paramsToQueryString(params);
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

  export(token: JWT | null, params?: AuditLogRequestModel) {
    let url = EXPORT_URL;

    if (params) {
      const queryString = paramsToQueryString(params);
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.streamRequest(url, token);
  }
}

function paramsToQueryString(params: AuditLogRequestModel): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}
