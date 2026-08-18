import { channelsApi } from '@/src/app/api/api';
import { getRequestToken } from '@/src/utils/auth/get-token';
import { apiResultToResponse } from '@/src/server/api';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const search = new URL(req.url).searchParams;
    const limit = Number(search.get('limit')) || 100;
    const offset = Number(search.get('offset')) || 0;
    const token = await getRequestToken(req);
    return apiResultToResponse(
      await channelsApi.getChannelDiscoveryDatasets(
        params.id,
        limit,
        offset,
        token,
      ),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
