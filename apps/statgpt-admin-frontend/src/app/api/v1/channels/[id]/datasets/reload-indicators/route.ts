import { channelsApi } from '../../../../../api';
import { getRequestToken } from '@/src/utils/auth/get-token';
import { apiResultToResponse } from '@/src/server/api';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getRequestToken(req);
    return apiResultToResponse(
      await channelsApi.reloadDataSets(params.id, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
