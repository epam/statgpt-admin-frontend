import { channelsApi } from '@/src/app/api/api';
import { getRequestToken } from '@/src/utils/auth/get-token';

export const runtime = 'nodejs';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const formData = await req.formData();
    const token = await getRequestToken(req);
    const result = await channelsApi.uploadChannelDiscoveryDatasets(
      params.id,
      formData,
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
