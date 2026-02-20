import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { auditLogsApi } from '@/src/app/api/api';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const token = await getToken({ req });
  const data = await auditLogsApi.getAuditLogById(params.id, token);

  return Response.json(data);
}
