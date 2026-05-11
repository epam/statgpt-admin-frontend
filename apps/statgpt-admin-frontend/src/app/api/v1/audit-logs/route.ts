import { NextRequest } from 'next/server';
import { auditLogsApi } from '../../api';
import { getToken } from 'next-auth/jwt';
import { apiResultToResponse } from '@/src/server/api';
import { mapSearchParamsToAuditLogRequest } from '@/src/utils/audit-logs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    const { searchParams } = new URL(req.url);
    const params = mapSearchParamsToAuditLogRequest(searchParams);
    return apiResultToResponse(await auditLogsApi.getAuditLogs(token, params));
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
