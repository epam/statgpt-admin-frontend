import { NextRequest } from 'next/server';
import { auditLogsApi } from '../../api';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  const data = await auditLogsApi.getAuditLogs(token);

  return Response.json(data);
}
