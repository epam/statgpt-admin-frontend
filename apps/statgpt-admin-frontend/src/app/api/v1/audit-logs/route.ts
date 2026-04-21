import { NextRequest } from 'next/server';
import { auditLogsApi } from '../../api';
import { getToken } from 'next-auth/jwt';
import { mapSearchParamsToAuditLogRequest } from '@/src/utils/audit-logs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    const { searchParams } = new URL(req.url);
    const params = mapSearchParamsToAuditLogRequest(searchParams);
    const data = await auditLogsApi.getAuditLogs(token, params);

    return Response.json(data);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
