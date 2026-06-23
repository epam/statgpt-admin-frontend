import { getRequestToken } from '@/src/utils/auth/get-token';
import { auditLogsApi } from '@/src/app/api/api';
import { apiResultToResponse } from '@/src/server/api';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getRequestToken(req);
    return apiResultToResponse(
      await auditLogsApi.getAuditLogById(params.id, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
