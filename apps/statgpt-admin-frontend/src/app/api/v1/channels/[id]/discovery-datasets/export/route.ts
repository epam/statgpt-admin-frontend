import { channelsApi } from '@/src/app/api/api';
import { getRequestToken } from '@/src/utils/auth/get-token';
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
    const search = new URL(req.url).searchParams;
    const token = await getRequestToken(req);
    return await channelsApi.exportChannelDiscoveryDatasets(params.id, token, {
      agency: search.get('agency') ?? undefined,
      validation_status: search.get('validation_status') ?? undefined,
      indexing_status: search.get('indexing_status') ?? undefined,
    });
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
