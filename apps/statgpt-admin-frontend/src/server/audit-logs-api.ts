import {
  AuditLog,
  AuditLogDetails,
  AuditLogEnumValues,
  AuditLogRequestModel,
} from '@/src/models/audit-log';
import { JWT } from 'next-auth/jwt';
import { RequestData } from '@/src/models/request-data';
import { ApiResult, MAIN_API } from './api';
import { BaseApi } from './base-api';
import { mapAuditLogRequestToQueryString } from '../utils/audit-logs';

const AUDIT_LOGS_URL = `${MAIN_API}/audit-logs`;
const AUDIT_LOGS_ID_URL = (id?: string | number): string =>
  `${AUDIT_LOGS_URL}/${id}`;
const EXPORT_URL = `${AUDIT_LOGS_URL}/export`;
const ENUM_VALUES_URL = `${AUDIT_LOGS_URL}/enum-values`;

export class AuditLogsApi extends BaseApi {
  getAuditLogs(
    token: JWT | null,
    params?: AuditLogRequestModel,
  ): Promise<ApiResult<RequestData<AuditLog>>> {
    let url = AUDIT_LOGS_URL;

    if (params) {
      const queryString = mapAuditLogRequestToQueryString(params);
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.get<RequestData<AuditLog>>(url, token);
  }

  getAuditLogById(
    id: string,
    token: JWT | null,
  ): Promise<ApiResult<RequestData<AuditLogDetails>>> {
    return this.get(AUDIT_LOGS_ID_URL(id), token);
  }

  export(token: JWT | null, params?: AuditLogRequestModel) {
    let url = EXPORT_URL;

    if (params) {
      const queryString = mapAuditLogRequestToQueryString(params);
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.streamRequest(url, token);
  }

  getEnumValues(token: JWT | null): Promise<ApiResult<AuditLogEnumValues>> {
    return this.get(ENUM_VALUES_URL, token);
  }
}
