import { channelsApi } from '@/src/app/api/api';
import { DiscoveryUploadMode } from '@/src/models/discovery-dataset';
import { getRequestToken } from '@/src/utils/auth/get-token';
import { guardDiscoveryDatasetsEnabled } from '@/src/server/feature-flag-guard';

export const runtime = 'nodejs';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const disabled = guardDiscoveryDatasetsEnabled();
  if (disabled) return disabled;

  try {
    const params = await context.params;
    const formData = await req.formData();
    const token = await getRequestToken(req);

    const modeParam = new URL(req.url).searchParams.get('mode');
    const mode = (Object.values(DiscoveryUploadMode) as string[]).includes(
      modeParam ?? '',
    )
      ? (modeParam as DiscoveryUploadMode)
      : DiscoveryUploadMode.Upsert;

    const result = await channelsApi.uploadChannelDiscoveryDatasets(
      params.id,
      formData,
      mode,
      token,
    );

    if (!result.ok) {
      return Response.json(
        result.error.raw ?? { error: result.error.message },
        {
          status: result.error.status || 500,
        },
      );
    }

    return Response.json(result.data);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
