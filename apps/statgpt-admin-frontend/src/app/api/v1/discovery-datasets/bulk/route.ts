import { channelsApi } from '@/src/app/api/api';
import { getRequestToken } from '@/src/utils/auth/get-token';
import { guardDiscoveryDatasetsEnabled } from '@/src/server/feature-flag-guard';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  const disabled = guardDiscoveryDatasetsEnabled();
  if (disabled) return disabled;

  try {
    const { item_ids: itemIds } = (await req.json()) as {
      item_ids: number[];
    };
    const token = await getRequestToken(req);
    const result = await channelsApi.removeDiscoveryDatasetsBulk(
      itemIds,
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
