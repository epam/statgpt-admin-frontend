import { channelsApi } from '@/src/app/api/api';
import { getRequestToken } from '@/src/utils/auth/get-token';
import { apiResultToResponse } from '@/src/server/api';
import { guardDiscoveryDatasetsEnabled } from '@/src/server/feature-flag-guard';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const disabled = guardDiscoveryDatasetsEnabled();
  if (disabled) return disabled;

  try {
    const params = await context.params;
    const token = await getRequestToken(req);
    return apiResultToResponse(
      await channelsApi.getChannelDiscoveryDatasetStats(params.id, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
