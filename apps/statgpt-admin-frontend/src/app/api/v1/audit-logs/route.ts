import { auditLogsApi } from '../../api';
import { getRequestToken } from '@/src/utils/auth/get-token';
import { apiResultToResponse } from '@/src/server/api';
import { mapSearchParamsToAuditLogRequest } from '@/src/utils/audit-logs';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = await getRequestToken(req);

    const { searchParams } = new URL(req.url);
    const params = mapSearchParamsToAuditLogRequest(searchParams);
    return apiResultToResponse(await auditLogsApi.getAuditLogs(token, params));
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
