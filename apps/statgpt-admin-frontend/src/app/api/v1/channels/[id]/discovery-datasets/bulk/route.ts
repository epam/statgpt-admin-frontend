import { channelsApi } from '@/src/app/api/api';
import { getRequestToken } from '@/src/utils/auth/get-token';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getRequestToken(req);
    const result = await channelsApi.clearChannelDiscoveryDatasets(
      params.id,
      token,
    );

    if (!result.ok) {
      return Response.json(
        { error: result.error.message },
        { status: result.error.status || 500 },
      );
    }

    return new Response(result.data, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
