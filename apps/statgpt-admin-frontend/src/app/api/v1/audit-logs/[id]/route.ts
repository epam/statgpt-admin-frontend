import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { auditLogsApi } from '@/src/app/api/api';
import { apiResultToResponse } from '@/src/server/api';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getToken({ req });
    return apiResultToResponse(
      await auditLogsApi.getAuditLogById(params.id, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
