import { getRequestToken } from '@/src/utils/auth/get-token';

import { channelsApi } from '../../../../../../api';
import { apiResultToResponse } from '@/src/server/api';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string; datasetId: string }> },
) {
  try {
    const params = await context.params;
    const token = await getRequestToken(req);
    return apiResultToResponse(
      await channelsApi.reloadDataSet(params.id, params.datasetId, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
